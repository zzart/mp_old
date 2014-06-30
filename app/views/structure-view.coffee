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
        #'page': '#page-region'
        'content': '#content-region'
        'header': '#header-region'
        'footer': '#footer-region'
        'info': '#info-region'
        'viewed': '#viewed-region'
        'login': '#login-region'
        'confirm': '#confirm-region'
        'popgeneric': '#popgeneric-region'

    attach: =>
        super
        @publishEvent('log:debug', 'StructureView: attach()')
        #check if we have all divs in markup debug --
        for key, val of @regions
            if $(val).length is 0
                @publishEvent('log:error', "No div present #{val}!! Doom!")



