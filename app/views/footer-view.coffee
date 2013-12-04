template = require 'views/templates/footer_base'
View = require 'views/base/view'

module.exports = class FooterView extends View
    template: template
    containerMethod : 'html'
    id: 'footer'
    attributes: { 'data-role':'footer', 'data-position':'fixed' }
    attach: =>
        super
        @publishEvent('log:info', 'FooterView:attach()')
