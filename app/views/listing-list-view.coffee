View = require 'views/list-view'
mediator = require 'mediator'

module.exports = class ListingListView extends View
    initialize: (params) ->
        super


    query_action: (event) =>
        super

        if _.isEmpty(event.target.value)
            @publishEvent("log:info", "removing key #{event.target.dataset.query}")
            @collection_hard.query_remove("#{event.target.dataset.query}")
        else
            query = {}
            query[event.target.dataset.query] = event.target.value
            @collection_hard.query_add(query)

        @publishEvent("log:info", "#{event.target.value},#{typeof(event.target.value)}")
        @publishEvent("log:info", "#{query},#{mediator.collections.listings.query}")

        @collection_hard.fetch
            data: @collection_hard.query
            beforeSend: =>
                @publishEvent 'tell_user', 'Ładuje oferty...'
            success: =>
                @collection = _.clone(@collection_hard)
                @render()
                # lets keep the items selected
                @selects_refresh()

            error: =>
                @publishEvent 'server_error'


    attach: =>
        super
        @publishEvent('log:info', 'view: listing list view afterRender()')





