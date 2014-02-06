View = require 'views/list-view'
mediator = require 'mediator'

module.exports = class ListingListView extends View
    initialize: (params) ->
        super
    attach: =>
        super
        @publishEvent('log:info', 'view: listing list view afterRender()')





