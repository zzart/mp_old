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


    additional_info:(tab_id) =>
        @publishEvent('log:info', "client-view: additional_info cought with #{tab_id}")
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

