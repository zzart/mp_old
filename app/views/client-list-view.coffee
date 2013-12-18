View = require 'views/list-view'
mediator = require 'mediator'

module.exports = class ClientListView extends View
    initialize: (params) ->
        super
    attach: =>
        super
        @publishEvent('log:info', 'view: client list view afterRender()')





