View = require 'views/base/view'
template = require 'views/templates/base_structure'
mediator = require 'mediator'
FooterView = require 'views/footer-view'

module.exports = class StructureView extends View
    #autoRender: true
    container: "body"
    containerMethod: 'html'
    id: 'page'
    attributes: { 'data-role':'page' }
    template: template
    regions:
        'page': '#page-region'
        'content': '#content-region'
        'footer': '#footer-region'
        'header': '#header-region'
        'info': '#info-region'
        'viewed': '#viewed-region'
        'login': '#login-region'
        'confirm': '#confirm-region'
        'popgeneric': '#popgeneric-region'

    attach: =>
        super
        @publishEvent('log:info', 'structureView: attach()')


