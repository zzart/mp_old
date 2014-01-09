template = require 'views/templates/header_base'
View = require 'views/base/view'
mediator = require 'mediator'

module.exports = class HeaderView extends View
    template: template
    containerMethod : 'html'
    id: 'header'
    attributes: { 'data-role':'header', 'data-theme':'b' }
    initialize: ->
        super
        @delegate 'click', '#first-name-placeholder', @login_screen

    login_screen: ->
        mediator.user = {}
        mediator.controllers = {}
        mediator.models = {}
        Chaplin.utils.redirectTo {url: '/login'}

    attach: =>
        super
        @publishEvent('log:info', 'HeaderView:attach()')

