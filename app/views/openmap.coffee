module.exports = class OpenMap
    initialize: (params) =>
        super
        @delegate 'filterablebeforefilter', '#autocomplete', @address_search
        @delegate 'click', '.address_suggestion', @fill_address



    fill_address: (event) ->
        @publishEvent('log:debug', 'fill address event')
        @address_reset()
        obj = @response[event.target.value]
        $("[name='postcode']").val(obj.address.postcode)
        $("[name='street']").val(obj.address.road or obj.address.pedestrian)
        $("[name='town']").val(obj.address.city or obj.address.village)
        $("[name='province']").val(obj.address.state.replace('województwo ', ''))
        $("[name='number']").val(obj.address.house_number)
        $("[name='town_district']").val(obj.address.city_district or obj.address.suburb)
        $("[name='lat']").val(obj.lat)
        $("[name='lon']").val(obj.lon)
        full_name = obj.display_name.split(',')
        for item in full_name
            # console.log('looping', item)
            if item.indexOf('powiat') > -1
                county = item
            else if item.indexOf('gmina') > -1
                borough = item
        @publishEvent('log:debug', "county:#{county}, borough:#{borough}, address.county:#{obj.address.county}, address.borough:#{obj.address.borough}")
        $("[name='borough']").val(borough or obj.address.borough or obj.address.village or obj.address.city)
        $("[name='county']").val(county or obj.address.county or '')
        #clean suggested list items
        $ul = $('ul#autocomplete.ui-listview')
        $('ul#autocomplete.ui-listview > li').remove()
        $ul.listview "refresh"

        #set point on the map
        projection = new OpenLayers.Projection("EPSG:4326")
        openlayers_projection = new OpenLayers.Projection("EPSG:900913")
        position =  new OpenLayers.LonLat(obj.lon,obj.lat).transform( projection, openlayers_projection)
        newPx = @map.getLayerPxFromLonLat(position)
        @marker.moveTo(newPx)
        zoom = 14
        @map.setCenter(position, zoom)

    address_search: (e,data)->
        self = @
        $ul = $('ul#autocomplete.ui-listview')
        $input = $(data.input)
        value = $input.val()
        html = ""
        $ul.html ""
        window.ul = $ul if mediator.online is false
        if value and value.length > 2
            $ul.html "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>"
            $ul.listview "refresh"
            $.ajax
                url: "http://nominatim.openstreetmap.org/search"
                dataType: 'json'
                crossDomain: true
                data:
                    q: $input.val()
                    addressdetails: 1
                    format: 'json'
                    'accept-language': 'pl'
                    countrycodes: 'pl'
                success:(response, type, rbody) ->
                    self.publishEvent('log:debug', "response from address server #{JSON.stringify(response)}")
                    self.response = response
                    i =0
                    for obj in response
                        html += "<li class='address_suggestion' value=#{i}>#{obj.display_name}</li>"
                        i++

                    $ul.html(html)
                    $ul.listview "refresh"
                    $ul.trigger "updatelayout"
                    # let do it manually anyway as jqm is crap
                    $('#autocomplete>li').removeClass('ui-screen-hidden')
                error:(error) ->
                    self.publishEvent('log:error', "no response from address server #{error}")
                    self.publishEvent('tell_user', 'Nie można połączyć się z serwerem adresowym')

    init_openstreet: =>
        @publishEvent('log:debug', 'init openstreet map')
        @openstreet()

    openstreet: ->
        @publishEvent('log:debug', 'opentstreet called')
        OpenLayers.ImgPath = "#{mediator.static_url}img/"
        $("#openmap").css('height', '400px')
        #NOTE: openlayers uses EPSG:900913 projection
        #we need a way to go from geolocation (EPSG:4326) to OpenLayers (EPSG:900913) and vice versa
        projection = new OpenLayers.Projection("EPSG:4326") #Transform from WGS 1984
        openlayers_projection = new OpenLayers.Projection("EPSG:900913") # Spherical Mercator Projection
        #set POLAND ;)
        lat= @model.get('lat') or 52.05
        lon = @model.get('lon') or 19.55
        if @model.get('lat')
            zoom = 15
        else
            zoom = 7
        #Init all the layers
        layer = new OpenLayers.Layer.OSM()
        markers = new OpenLayers.Layer.Markers( "Markers",
            projection: projection
            displayProjection: projection

        )
        vlayer = new OpenLayers.Layer.Vector( "Editable",
            projection: projection
            displayProjection: projection
        )
        map = new OpenLayers.Map( "openmap",
            controls: [
                new OpenLayers.Control.PanZoom(),
                # new OpenLayers.Control.EditingToolbar(vlayer)
                ]
            units: 'km'
            projection: projection
            displayProjection: projection
        )
        map.addLayers([layer, vlayer, markers])
        map.addControl(new OpenLayers.Control.MousePosition())
        map.addControl(new OpenLayers.Control.Navigation())
        map.addControl(new OpenLayers.Control.OverviewMap())
        map.addControl(new OpenLayers.Control.Attribution())
        ##TODO: map.addControl(new OpenLayers.Control.Geolocate())
        lonLat = new OpenLayers.LonLat(lon, lat).transform(projection, map.getProjectionObject())
        map.setCenter(lonLat, zoom)

        ##markers
        size = new OpenLayers.Size(21,25)
        offset = new OpenLayers.Pixel(-(size.w/2), -size.h)
        icon = new OpenLayers.Icon("#{mediator.static_url}img/marker.png", size, offset)
        marker = new OpenLayers.Marker(
            new OpenLayers.LonLat(0,0).transform(projection), icon)
            # ).transform(projection, openlayers_projection), icon)
        markers.addMarker(marker)

        #for further referance
        @map = map
        @marker = marker

        # if we have coordinates , set them on the map
        if @model.get('lon')
            position =new OpenLayers.LonLat( @model.get('lon'),@model.get('lat'))
                .transform( projection, openlayers_projection)
            newPx = @map.getLayerPxFromLonLat(position)
            @marker.moveTo(newPx)
            @map.setCenter(position, zoom)

        # add mark on click
        map.events.register "click", map, (e) ->
            opx = map.getLayerPxFromViewPortPx(e.xy)
            lonLat = map.getLonLatFromPixel(e.xy)
            marker.map = map
            marker.moveTo(opx)
            new_position = marker.lonlat.transform(openlayers_projection, projection)
            $("[name='lat']").val(new_position.lat)
            $("[name='lon']").val(new_position.lon)


