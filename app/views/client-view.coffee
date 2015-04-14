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


    search_listings: (form, titleEditor, extra) =>
        if form is undefined
            lat = $("input[name='lat']").val()
            lon = $("input[name='lon']").val()
            @publishEvent('log:debug', "search_listings: we have coordinates #{lat} #{lon}")
        else
            @publishEvent('log:debug', "search_listings: #{titleEditor.key} = #{titleEditor.el.value}")
        # lets gether all form data
        arr = ['price_max', 'price_min', 'rooms_min', 'rooms_max', 'size_min', 'size_max', 'lat', 'lon', 'distance']
        data = {}
        for key in arr
            data[key] = parseFloat(@form.getEditor(key).el.value)
        data['category'] = @form.getEditor('category').el.value
        data['bbox'] = @form.getEditor('bbox').el.value
        mediator.collections.suggestions = new Collection
        mediator.collections.suggestions.url = "#{mediator.server_url}v1/szukaj"
        mediator.collections.suggestions.fetch
            data: data
            success: =>
                @publishEvent('log:debug', "data fetched ok" )
                console.log(mediator.collections.suggestions)
                #@subview "client_owned", new SubView(
                #    collection: mediator.collections.client_owned
                #    template: "listing_list_view"
                #    filter: 'status'
                #    region: 'client_owned'
                #    mobile: true
                #    #listing_type: @listing_type
                #    controller: 'listing_controller'
                #    route_params: []
                #)
                #@subview("suggestion").render()
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
            @publishEvent('log:info', "client-view: additional_info tab 4")
            mediator.collections.client_showed = new Collection
            mediator.collections.client_showed.url = "#{mediator.server_url}v1/klienci/#{@model.id}/akcja/5"
            mediator.collections.client_showed.fetch
                success: =>
                    @publishEvent('log:debug', "data fetched ok" )
                    @subview "client_showed", new SubView(
                        collection: mediator.collections.client_showed
                        template: "listing_list_view"
                        filter: 'status'
                        region: 'client_showed'
                        mobile: true
                        #listing_type: @listing_type
                        controller: 'listing_controller'
                        route_params: []
                    )
                    @subview("client_showed").render()
                error: =>
                    @publishEvent 'server_error'
            mediator.collections.client_sent = new Collection
            mediator.collections.client_sent.url = "#{mediator.server_url}v1/klienci/#{@model.id}/akcja/4"
            mediator.collections.client_sent.fetch
                success: =>
                    @publishEvent('log:debug', "data fetched ok" )
                    @subview "client_sent", new SubView(
                        collection: mediator.collections.client_sent
                        template: "listing_list_view"
                        filter: 'status'
                        region: 'client_sent'
                        mobile: true
                        #listing_type: @listing_type
                        controller: 'listing_controller'
                        route_params: []
                    )
                    @subview("client_showed").render()
                error: =>
                    @publishEvent 'server_error'

    attach: =>
        super
        @publishEvent('log:info', 'view: clientadd afterRender()')

