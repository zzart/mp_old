template = require 'views/templates/footer_navbar'
View = require 'views/base/view'

module.exports = class FooterView extends View
    template: template
    containerMethod : 'html'
    id: 'footer'
    attributes: { 'data-role':'footer', 'data-position':'fixed', 'data-theme':'b' }

    attach: =>
        super
        @publishEvent('log:info', 'FooterNav___View:attach()')
        @publishEvent 'jqm_page_refersh:render'
