View = require 'views/edit-view'
mediator = require 'mediator'
module.exports = class AddView extends View
    initialize: (params) =>
        super
        # send url data from controler
        @delegate 'filterablebeforefilter', '#autocomplete', _.debounce(@address_search,3000)
        @delegate 'click', '.address_suggestion', @fill_address


    save_action: (url) =>
        super
        @publishEvent('log:info','commmit form')
        #run model and schema validation
        if _.isUndefined(@form.commit({validate:true}))
            @model.save({},{
                success:(event) =>
                    wait: true
                    if mediator.collections[@listing_type]?
                        # add it to collection so we don't need to use server ...
                        mediator.collections[@listing_type].add(@model)
                    @publishEvent 'tell_user', 'Rekord zapisany'
                    console.log(url)
                    # Chaplin.utils.redirectTo {url: url ? '/klienci'}
                error:(model, response, options) =>
                    if response.responseJSON?
                        Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                    else
                        Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'
            })
        else
            @publishEvent 'tell_user', 'Błąd w formularzu!'

    fill_address: (event) ->
        @publishEvent('log:info', 'fill address event')
        obj = @response[event.target.value]
        window.addr = obj
        $("[name='postcode']").val(obj.address.postcode)
        $("[name='street']").val(obj.address.road)
        $("[name='town']").val(obj.address.city)
        $("[name='province']").val(obj.address.state)
        $("[name='quarter']").val(obj.address.city_district)
        $("[name='province']").val(obj.address.state)
        $("[name='lat']").val(obj.lat)
        $("[name='lng']").val(obj.lon)
        full_name = obj.display_name.split(',')
        for item in full_name
            console.log('looping', item)
            if item.indexOf('powiat') > -1
                district = item
            else if item.indexOf('gmina') > -1
                commune = item
        $("[name='commune']").val(commune or '')
        $("[name='district']").val(district or '')
        #clean suggested list items
        $ul = $('ul#autocomplete.ui-listview')
        $('ul#autocomplete.ui-listview > li').remove()
        $ul.listview "refresh"

    address_search: (e,data)->
        self = @
        $ul = $('ul#autocomplete.ui-listview')
        $input = $(data.input)
        value = $input.val()
        html = ""
        $ul.html ""
        window.ul = $ul
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

                    $ul.html html
                    $ul.listview "refresh"
                    $ul.trigger "updatelayout"
                error:(error) ->
                    self.publishEvent('log:error', "no response from address server #{error}")
                    publishEvent('tell_user', 'Nie można połączyć się z serwerem adresowym')

    openstreet: ->
        OpenLayers.ImgPath = 'img/'
        $("#openmap").css('height', '200px')
        lat = 6651050.4274274
        lon= 2209967.3614734
        zoom = 7
        #map, layer;
        layer = new OpenLayers.Layer.OSM()
        #markers = new OpenLayers.Layer.Markers( "Markers" )
        #vlayer = new OpenLayers.Layer.Vector( "Editable" )
        map = new OpenLayers.Map( 'openmap',
            controls: [
                new OpenLayers.Control.PanZoom(),
                #new OpenLayers.Control.EditingToolbar(vlayer)
                ]
        )
        #map.addLayers([layer, vlayer, markers])
        map.addLayers([layer])
        window.map = map
        #map.setCenter(new OpenLayers.LonLat(lon, lat), zoom)
        #map.addLayers([vlayer])
        #map.addLayers([markers])
        #map.addControl(new OpenLayers.Control.MousePosition())
        #map.addControl(new OpenLayers.Control.OverviewMap())
        #map.addControl(new OpenLayers.Control.Attribution())
        ##TODO: map.addControl(new OpenLayers.Control.Geolocate())
        #map.setCenter(new OpenLayers.LonLat(lon, lat), zoom)

        ##markers
        #size = new OpenLayers.Size(21,25)
        #offset = new OpenLayers.Pixel(-(size.w/2), -size.h)
        #icon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png', size, offset)
        #marker = new OpenLayers.Marker(new OpenLayers.LonLat(0,0),icon)
        #markers.addMarker(marker)


        #map.events.register "click", map , (e) ->
        #    opx = map.getLayerPxFromViewPortPx(e.xy)
        #    lonLat = map.getLonLatFromPixel(e.xy)
        #    console.log(opx, lonLat, map)
        #    console.log(e)
        #    marker.map = map
        #    marker.moveTo(opx)

    attach: =>
        super
        @openstreet()
