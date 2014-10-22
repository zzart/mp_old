View = require 'views/header-action-view'
mediator = require 'mediator'

module.exports = class View extends View
    autoRender: true
    containerMethod : 'html'
    container : '#right-panel'
    initialize: (options) =>
        super
        @template = options.template

    attach: =>
        super
        # panel content needs manuall refresh
        @$el.enhanceWithin()
        @publishEvent('log:debug', 'NavigationView: afterAttach()')

