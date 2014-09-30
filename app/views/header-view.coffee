template = require 'views/templates/header_base'
View = require 'views/header-base-view'
mediator = require 'mediator'

module.exports = class HeaderView extends View
    template: template
    containerMethod : 'html'
    id: 'header'

    attach: =>
        super
        $("#header").enhanceWithin()
        @publishEvent('log:debug', 'HeaderView:attach()')

