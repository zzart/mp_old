View = require 'views/edit-view'
mediator = require 'mediator'
Collection = require 'models/listing-collection'
SubView = require 'views/listing-list-view'

module.exports = class ClientView extends View
    initialize: (options) =>
        super
        @subscribeEvent('edit-view:tab_changed', @additional_info)
        @registerRegion 'client_owned', '#client_owned'
        @registerRegion 'client_showed', '#client_showed'
        @registerRegion 'client_sent', '#client_sent'
        @registerRegion 'client_suggest', '#client_suggest'
        # to query client preferences --------------
        @form.on('price_max:change', @search_listings)
        @form.on('price_min:change', @search_listings)
        @form.on('rooms_min:change', @search_listings)
        @form.on('rooms_max:change', @search_listings)
        @form.on('size_min:change', @search_listings)
        @form.on('size_max:change', @search_listings)
        @form.on('lat:change', @search_listings)
        @form.on('lon:change', @search_listings)
        @form.on('distance:change', @search_listings)
        @form.on('category:change', @search_listings)
        @subscribeEvent('map:fill_address', @search_listings)
        # end to query client preferences --------------
        @subscribeEvent('client_showed:add', @dropped_showed)
        @subscribeEvent('client_sent:add', @dropped_sent)
        @subscribeEvent('client_suggest:drag', @drag)
        @dragged_model = undefined


    drag:(e) ->
        @dragged_model = mediator.collections.client_suggest.get(e.target.dataset.id)
        @publishEvent('log:debug', "dragged el id is: #{@dragged_model}")

    dropped_showed:(e) ->
        @publishEvent('log:debug', "dropped showed")
        e.preventDefault()
        if @dragged_model
            url = "#{@dragged_model.urlRoot}/#{@dragged_model.id}/pokaz/#{@model.id}"
            @mp_request(@dragged_model, url, 'GET', 'Oferta zaznaczona do pokazania')
            mediator.collections.client_showed.add(@dragged_model)
            @subview("client_showed").render()
            @dragged_model = undefined

    dropped_sent:(e) ->
        @publishEvent('log:debug', "dropped sent")
        e.preventDefault()
        if @dragged_model
            url = "#{@dragged_model.urlRoot}/#{@dragged_model.id}/email/#{@model.id}?private=false"
            @mp_request(@dragged_model, url, 'GET', 'Email został wysłany')
            mediator.collections.client_sent.add(@dragged_model)
            @subview("client_sent").render()
            @dragged_model = undefined


    search_listings:(form, titleEditor, extra) =>
        @publishEvent('log:debug', "search_listings called")
        # lets gether all form data
        arr = ['price_max', 'price_min', 'rooms_min', 'rooms_max', 'size_min', 'size_max', 'lat', 'lon', 'distance']
        data = {}
        for key in arr
            data[key] = parseFloat(@form.getEditor(key).el.value)
        data['category'] = @form.getEditor('category').el.value
        data['bbox'] = @form.getEditor('bbox').el.value
        if !!data['bbox']
            mediator.collections.client_suggest = new Collection
            mediator.collections.client_suggest.url = "#{mediator.server_url}v1/szukaj"
            mediator.collections.client_suggest.fetch
                data: data
                success: =>
                    @publishEvent('log:debug', "data fetched ok" )
                    @subview "client_suggest", new SubView(
                        collection: mediator.collections.client_suggest
                        template: "listing_list_view"
                        filter: 'status'
                        region: 'client_suggest'
                        mobile: true
                        #listing_type: @listing_type
                        controller: 'listing_controller'
                        route_params: []
                    )
                    @subview("client_suggest").render()
                    $("#client_suggest>div>ul>li").attr('draggable', 'true')
                    $("#client_suggest>div>ul>li").attr('ondragstart', 'Chaplin.mediator.publish("client_suggest:drag", event)')
                    ondragstart="drag(event)"
                error: =>
                    @publishEvent 'server_error'


    additional_info:(tab_id) =>
        @publishEvent('log:debug', "client-view: additional_info cought with #{tab_id}")
        # don't do this with new model as it doesn't have ID yet nor it has other objects
        return unless @model.isNew() is false
        if tab_id is 'tab_2'
            mediator.collections.client_owned = new Collection
            mediator.collections.client_owned.fetch
                data: {'client': @model.id}
                success: =>
                    @publishEvent('log:debug', "data fetched ok" )
                    @subview "client_owned", new SubView(
                        collection: mediator.collections.client_owned
                        template: "listing_list_view"
                        filter: 'status'
                        region: 'client_owned'
                        mobile: true
                        #listing_type: @listing_type
                        controller: 'listing_controller'
                        route_params: []
                    )
                    @subview("client_owned").render()
                error: =>
                    @publishEvent 'server_error'

        else if tab_id is 'tab_3'
            @publishEvent('log:debug', "client-view: additional_info tab 4")
            @client_sent_listings()
            @client_showed_listings()
            @search_listings()

    client_showed_listings: =>
        self = @ # to make subview available for rerendering
        mediator.collections.client_showed = new Collection
        mediator.collections.client_showed.url = "#{mediator.server_url}v1/klienci/#{@model.id}/akcja/5"
        mediator.collections.client_showed.fetch
            success: =>
                @publishEvent('log:debug', "data fetched ok" )
                self.subview "client_showed", new SubView(
                    collection: mediator.collections.client_showed
                    template: "listing_list_view"
                    filter: 'status'
                    region: 'client_showed'
                    mobile: true
                    #listing_type: @listing_type
                    controller: 'listing_controller'
                    route_params: []
                )
                self.subview("client_showed").render()
                $("#client_showed").attr('ondrop', 'Chaplin.mediator.publish("client_showed:add", event)')
            error: =>
                @publishEvent 'server_error'

    client_sent_listings: =>
        self = @ # to make subview available for rerendering
        mediator.collections.client_sent = new Collection
        mediator.collections.client_sent.url = "#{mediator.server_url}v1/klienci/#{@model.id}/akcja/4"
        mediator.collections.client_sent.fetch
            success: =>
                @publishEvent('log:debug', "data fetched ok" )
                self.subview "client_sent", new SubView(
                    collection: mediator.collections.client_sent
                    template: "listing_list_view"
                    filter: 'status'
                    region: 'client_sent'
                    mobile: true
                    #listing_type: @listing_type
                    controller: 'listing_controller'
                    route_params: []
                )
                self.subview("client_sent").render()
                $("#client_sent").attr('ondrop', 'Chaplin.mediator.publish("client_sent:add", event)')
            error: =>
                @publishEvent 'server_error'

    attach: =>
        super
        @publishEvent('log:info', 'view: clientadd afterRender()')

