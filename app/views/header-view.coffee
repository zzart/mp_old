template = require 'views/templates/header_base'
View = require 'views/base/view'
mediator = require 'mediator'

module.exports = class HeaderView extends View
    template: template
    containerMethod : 'html'
    id: 'header'
    attributes: { 'data-role':'header' }
    initialize: ->
        @delegate 'click', '#first-name-placeholder', @login_screen

    login_screen: ->
        mediator.user = {}
        mediator.controllers = {}
        mediator.models = {}
        Chaplin.helpers.redirectTo {url: '/login'}

    attach: =>
        super
        @publishEvent('log:info', 'HeaderView:attach()')

