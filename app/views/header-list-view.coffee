View = require 'views/header-base-view'
mediator = require 'mediator'

module.exports = class HeaderListView extends View
    containerMethod : 'append'
    id: 'sub_header'
    region: 'header'

    initialize: (options) ->
        super
        @template = require "views/templates/#{options.template}"

    attach: =>
        super
        $("#sub_header").enhanceWithin()
        @publishEvent('log:debug', 'HeaderListView:attach()')

