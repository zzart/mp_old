View = require 'views/edit-view'
TabView = require 'views/listing-tab-view'
mediator = require 'mediator'
module.exports = class AddView extends View
    initialize: (params) =>
        super
        # send url data from controler
        @delegate 'filterablebeforefilter', '#autocomplete', _.debounce(@address_search,1500)
        @delegate 'click', '.address_suggestion', @fill_address
        @delegate 'click', "[data-role='navbar'] a", @change_tab
        @delegate 'change', "[name='category']", @rerender_form
        @delegate 'click', "#copy_address", @copy_address
        @rendered_tabs = []
        @categories = localStorage.getObject('categories')
        # console.log(@options)


    change_tab: (e)=>
        e.preventDefault()
        #NOTE: this assumes that we don't have more then 9 tabs (value [1] gets only one digit) !!
        @publishEvent('log:info', "change tab #{e.target.attributes.href.value[1]}")
        tab_id = "tab_#{e.target.attributes.href.value[5]}"
        @render_subview(tab_id)

    rerender_form: (e) =>
        selected_id = parseInt(e.target.value)
        current_form_name = @form_name.substring(0, @form_name.length - 5)
        current_category_id = @categories[current_form_name]
        # console.log(e, current_category_id, current_form_name, parseInt(e.target.value))
        if current_category_id isnt selected_id
            # flip categories dict and construct ie. flat_sell_schema
            cat = _.invert(@categories)
            @form_name = "#{cat[selected_id]}_form"
            @model.schema = localStorage.getObject("#{cat[selected_id]}_schema")
            @rendered_tabs = []
            $("#content").empty()
            @render()
            @render_subview()




    save_action: (url) =>
        super
        @publishEvent('log:info','commmit form')
        #run model and schema validation
        if _.isUndefined(@form.commit({validate:true}))
            @model.save({},{
                success:(event) =>
                    wait: true
                    if mediator.collections.listings?
                        # add it to collection so we don't need to use server ...
                        mediator.collections.listings.add(@model)
                    @publishEvent 'tell_user', "Rekord #{@model.get_url()} zapisany"
                    Chaplin.utils.redirectTo {url: url ? "/oferty?#{$.param(mediator.collections.listings.query)}"}
                error:(model, response, options) =>
                    if response.responseJSON?
                        Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                    else
                        Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'
            })
        else
            @publishEvent 'tell_user', 'Błąd w formularzu!'


    delete_action: =>
        super
        @model.destroy
            success: (event) =>
                # type = _.invert(localStorage.getObject('category'))[@model.get('category')]
                mediator.collections.listings.remove(@model)
                @publishEvent 'tell_user', 'Rekord został usunięty'
                Chaplin.utils.redirectTo {url: url ? "/oferty?#{$.param(mediator.collections.listings.query)}"}
            error:(model, response, options) =>
                if response.responseJSON?
                    Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                else
                    Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'

    back_action: =>
        super
        # coming from HOMEPAGE and pressing back button causes no listings to be present yet
        # need to redirect back to HOMEPAGE is this case
        if mediator.collections.listings? is true
            Chaplin.utils.redirectTo {url: "/oferty?#{$.param(mediator.collections.listings.query )}"}
        else
            Chaplin.utils.redirectTo {url: "/"}

    copy_address: (event) ->
        @publishEvent('log:info', 'copy address event')
        event.preventDefault()
        $("[name='internet_postcode']").val($("[name='postcode']").val())
        $("[name='internet_street']").val(  $("[name='street']").val())
        $("[name='internet_town']").val(    $("[name='town']").val())
        $("[name='internet_province']").val($("[name='province']").val())
        $("[name='internet_town_district']").val( $("[name='town_district']").val())
        $("[name='internet_lat']").val(     $("[name='lat']").val())
        $("[name='internet_lon']").val(     $("[name='lon']").val())
        $("[name='internet_borough']").val( $("[name='borough']").val())
        $("[name='internet_county']").val($("[name='county']").val())

    address_reset: ->
        @publishEvent('log:info', 'address reset')
        $("[name='internet_postcode']").val('')
        $("[name='postcode']").val('')
        $("[name='internet_street']").val('')
        $("[name='street']").val('')
        $("[name='internet_town']").val('')
        $("[name='town']").val('')
        $("[name='internet_province']").val('')
        $("[name='province']").val('')
        $("[name='internet_town_district']").val('')
        $("[name='town_district']").val('')
        $("[name='internet_lat']").val('')
        $("[name='lat']").val('')
        $("[name='internet_lon']").val('')
        $("[name='lon']").val('')
        $("[name='internet_borough']").val('')
        $("[name='borough']").val('')
        $("[name='internet_county']").val('')
        $("[name='county']").val('')

    fill_address: (event) ->
        @publishEvent('log:info', 'fill address event')
        @address_reset()
        obj = @response[event.target.value]
        $("[name='postcode']").val(obj.address.postcode)
        $("[name='street']").val(obj.address.road or obj.address.pedestrian)
        $("[name='town']").val(obj.address.city)
        $("[name='province']").val(obj.address.state)
        $("[name='town_district']").val(obj.address.city_district)
        $("[name='lat']").val(obj.lat)
        $("[name='lon']").val(obj.lon)
        full_name = obj.display_name.split(',')
        for item in full_name
            # console.log('looping', item)
            if item.indexOf('powiat') > -1
                county = item
            else if item.indexOf('gmina') > -1
                borough = item
        $("[name='borough']").val(borough or '')
        $("[name='county']").val(county or '')
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
                    self.publishEvent('tell_user', 'Nie można połączyć się z serwerem adresowym')

    init_openstreet: =>
        @publishEvent('log:info', 'init openstreet map')
        @openstreet()

    openstreet: ->
        @publishEvent('log:debug', 'opentstreet called')
        OpenLayers.ImgPath = 'img/'
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
        icon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png', size, offset)
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


    render: =>
        #NOTE:
        #we want to split it into parts which we can render quickly
        super
        @get_form()
        base_template = @form.template()
        $bt = $(base_template)
        $bt.find('.ui-grid-a').remove()
        window.bt = $bt
        @$el.append($bt)
        @publishEvent('log:info', 'view: edit-view RenderEnd()')

    render_subview: (tab_id='tab_1')=>
        #NOTE: this assumes that we don't have more then 9 tabs (value [1] gets only one digit and substracts one for array compatybility) !!
        @publishEvent('log:info', "render sub_view #{tab_id}")
        # console.log('->>', @el, tab_id, id)
        if tab_id not in @rendered_tabs
            $temp = $(@form.el).find("##{tab_id}")
            # console.log('---> ', @form.el, $temp, tab_id)
            window.form = @form
            @subview tab_id, new TabView container: @el, template: $temp, id: tab_id
            @subview(tab_id).render()
            if tab_id is 'tab_2'
                @init_openstreet()
            if tab_id is 'tab_6'
                @init_events()
                @init_uploader()
                @init_sortable()
            if tab_id is 'tab_1'
                # lets set category whatever the form might be
                current_form_name = @form_name.substring(0, @form_name.length - 5)
                current_category_id = @categories[current_form_name]
                $("[name='category']").val(current_category_id)

            @publishEvent 'jqm_refersh:render'
            @rendered_tabs.push(tab_id)

    attach: =>
        super
        @publishEvent('log:info', "listing-add attach")
        @render_subview()
