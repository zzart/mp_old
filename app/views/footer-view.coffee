template = require 'views/templates/footer_base'
View = require 'views/base/view'

module.exports = class FooterView extends View
    template: template
    containerMethod : 'html'
    id: 'footer'
    attributes: { 'data-role':'footer', 'data-position':'fixed' , 'data-theme':'b' }
    attach: =>
        super
        # this is FIX for annoying footer behaviour on HOMEPAGE
        # basically @el after being attached was being moved by JQM to be outside page layout
        # this introduced incosistency as all footers need to remain inside #footer-region div
        # therefore we manually appending it to here it supposed to be
        new_el = _.clone(@el)
        _.delay(->
            $("#footer-region").append(new_el.outerHTML)
        , 30)
        @publishEvent('log:info', 'FooterView:attach')
        @publishEvent 'jqm_footer_refersh:render'
