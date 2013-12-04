template = require 'views/templates/header_base'
View = require 'views/base/view'

module.exports = class HeaderView extends View
    template: template
    containerMethod : 'html'
    id: 'header'
    attributes: { 'data-role':'header' }
    attach: =>
        super
        @publishEvent('log:info', 'HeaderView:attach()')

