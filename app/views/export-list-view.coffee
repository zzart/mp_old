View = require 'views/list-view'
mediator = require 'mediator'

module.exports = class ExportListView extends View
    initialize: (params) ->
        super
    attach: =>
        super
        @publishEvent('log:info', 'view: export list view afterRender()')

