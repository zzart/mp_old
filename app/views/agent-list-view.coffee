View = require 'views/list-view'
mediator = require 'mediator'

module.exports = class ListView extends View
    initialize: (options) ->
        super
        # send url data from controler

    attach: =>
        super
        @publishEvent('log:info', 'view: agent list afterRender()')
