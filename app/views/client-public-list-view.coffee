View = require 'views/list-view'
mediator = require 'mediator'

module.exports = class ClientListView extends View
    initialize: (options) ->
        super

    attach: =>
        super
        @publishEvent('log:info', 'view: client public list afterRender()')
