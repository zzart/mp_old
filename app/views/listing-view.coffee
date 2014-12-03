View = require 'views/edit-view'
TabView = require 'views/listing-tab-view'
mediator = require 'mediator'
Collection = require 'models/listing-collection'

module.exports = class AddView extends View
    initialize: (params) =>
        super
        # send url data from controler
        @delegate 'filterablebeforefilter', '#autocomplete', @address_search
        # @delegate 'filterablebeforefilter', '#autocomplete', _.debounce(@address_search,1500)
        @delegate 'click', '.address_suggestion', @fill_address
        #@delegate 'click', "[data-role='navbar'] a", @change_tab
        @subscribeEvent('header:change_tab', @change_tab)
        @delegate 'change', "[name='category']", @rerender_form
        @delegate 'click', "#copy_address", @copy_address
        @rendered_tabs = []
        @categories = localStorage.getObject('categories')
        @is_new = false
        # console.log(@options)

    change_tab: (e)=>
        @publishEvent('log:info', "change tab #{e.target.dataset.id}")
        tab_id = "tab_#{e.target.dataset.id}"
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

    update_home_page: ->
        @publishEvent('log:debug','update_home_page')
        # if model has been saved we will most probably need to refresh HOMEPAGE view
        # instead of doing another fetch and putting it to localstorage we can do it now
        # look for ids in localstorage and replace or add this new model
        # NOTE: JSON.stringify to comply with a server response ( which is a string type )
        # for LATEST_MODYFIED models on home page
        latest_modyfied = new Collection
        latest_modyfied.set(JSON.parse(localStorage.getObject('latest_modyfied')))
        @publishEvent('log:debug', "check for latest_modyfied: #{latest_modyfied.get(@model.id)}")
        if _.isUndefined(latest_modyfied.get(@model.id))
            #remove one form the back
            latest_modyfied.pop()
            # append new one to the beginning
            latest_modyfied.unshift(@model)
            localStorage.setObject('latest_modyfied', JSON.stringify(latest_modyfied))
        else
            #get rid of old model
            latest_modyfied.remove(@model.id)
            # append new one to the beginning
            latest_modyfied.unshift(@model)
            localStorage.setObject('latest_modyfied', JSON.stringify(latest_modyfied))

        # for NEW models on home page
        if @is_new
            latest = new Collection
            latest.set(JSON.parse(localStorage.getObject('latest')))
            if _.isUndefined(latest.get(@model.id))
                #remove one form the back
                latest.pop()
                # append new one to the beginning
                latest.unshift(@model)
                localStorage.setObject('latest', JSON.stringify(latest))
            else
                #get rid of old model
                latest.remove(@model.id)
                # append new one to the beginning
                latest.unshift(@model)
                localStorage.setObject('latest', JSON.stringify(latest))


    save_action: (url) =>
        super
        # need to check before record is commited to the server and becomes old ....
        @is_new = @model.isNew()
        @publishEvent 'log:debug', "Rekord nowy : #{@is_new}"

        @publishEvent('log:debug','commmit form')
        #run model and schema validation
        if _.isUndefined(@form.commit({validate:true}))
            @model.save({},{
                success:(event) =>
                    wait: true
                    if mediator.collections.listings?
                        # add it to collection so we don't need to use server ...
                        mediator.collections.listings.add(@model)
                    # if model has been saved we will most probably need to refresh HOMEPAGE view
                    @update_home_page()
                    @publishEvent 'tell_user', "Rekord #{@model.get_url()} zapisany"
                    # if no query being done and we doing save this changs forever
                    # so redirect to HOME if url or listing.query is undefined
                    if mediator.collections.listings?.query?
                        Chaplin.utils.redirectTo {url: url ? "/oferty?#{$.param(mediator.collections.listings.query)}"}
                    else
                        Chaplin.utils.redirectTo {url: url ? "/"}
                error:(model, response, options) =>
                    if response.responseJSON?
                        Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                    else
                        Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'
            })
        else
            @publishEvent 'tell_user', 'Błąd w formularzu! Pola zaznaczone pogrubioną czcionką należy wypełnić.'


    delete_action: =>
        super
        @model.destroy
            success: (event) =>
                # type = _.invert(localStorage.getObject('category'))[@model.get('category')]
                mediator.collections.listings?.remove(@model)
                @publishEvent 'tell_user', 'Rekord został usunięty'
                # if no query being done and we doing save this changs forever
                # so redirect to HOME if url or listing.query is undefined
                if mediator.collections.listings?.query?
                    Chaplin.utils.redirectTo {url: url ? "/oferty?#{$.param(mediator.collections.listings.query)}"}
                else
                    Chaplin.utils.redirectTo {url: url ? "/"}
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
        @publishEvent('log:debug', 'copy address event')
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
        @publishEvent('log:debug', 'address reset')
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
        $("[name='number']").val('')

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


    render: =>
        #NOTE:
        #we want to split it into parts which we can render quickly
        super
        @get_form()
        base_template = @form.template()
        $bt = $(base_template)
        $bt.find('.ui-grid-a').remove()
        @$el.append($bt)
        @publishEvent('log:debug', 'view: edit-view RenderEnd()')

    render_subview: (tab_id='tab_1')=>
        #NOTE: this assumes that we don't have more then 9 tabs (value [1] gets only one digit and substracts one for array compatybility) !!
        @publishEvent('log:debug', "render sub_view #{tab_id}")
        if tab_id not in @rendered_tabs
            $temp = $(@form.el).find("##{tab_id}")
            # console.log('---> ', @form.el, $temp, tab_id)
            @subview tab_id, new TabView container: @el, template: $temp, id: "content_#{tab_id}"
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
        else
            #we've rendered this tab already so just make it visible
            $('div[id^=content_tab_]').css('display', 'none')
            # unhide the one we need
            $("#content_#{tab_id}").css('display', 'inline')


    attach: =>
        super
        @publishEvent('log:debug', "listing-add attach")
        @render_subview()
