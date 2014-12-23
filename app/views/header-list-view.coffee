View = require 'views/header-action-view'
mediator = require 'mediator'

module.exports = class HeaderListView extends View
    containerMethod : 'append'
    id: 'sub_header'
    region: 'header'

    initialize: (options) ->
        super
        @publishEvent('log:debug', "initialized HeaderListView with #{options.template}")
        @template = require "views/templates/#{options.template}"

    attach: =>
        super
        $("#sub_header").enhanceWithin()
        test = @getTemplateData()
        #console.log(JSON.stringify(test))
        @publishEvent('log:debug', 'HeaderListView:attach()')

