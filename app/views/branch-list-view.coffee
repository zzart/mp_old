View = require 'views/list-view'
mediator = require 'mediator'

module.exports = class BranchListView extends View
    initialize: (options) ->
        super

    attach: =>
        super
        @publishEvent('log:info', 'view: branch-list afterRender()')
