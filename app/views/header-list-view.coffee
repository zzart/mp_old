template = require 'views/templates/header_list'
HeaderBase = require 'views/header-base-view'
mediator = require 'mediator'

module.exports = class HeaderListView extends HeaderBase
    template: template
    containerMethod : 'html'
    id: 'header'
    region: 'header'

    initialize: ->
        super

    attach: =>
        super
        $("#header").enhanceWithin()
        @publishEvent('log:debug', 'HeaderView:attach()')

