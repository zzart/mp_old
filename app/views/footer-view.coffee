template = require 'views/templates/footer_base'
View = require 'views/base/view'

module.exports = class FooterView extends View
    template: template
    containerMethod : 'html'
    id: 'footer'
    attributes: { 'data-role':'footer', 'data-position':'fixed' , 'data-theme':'b' }

    getTemplateData: =>
        # model: @model
        browser_name: bowser.name
        browser_version: bowser.version
        browser_mobile: bowser.mobile or ''

    attach: =>
        super
        # this is FIX for annoying footer behaviour on HOMEPAGE
        # basically @el after being attached was being moved by JQM to be outside page layout
        # this introduced incosistency as all footers need to remain inside #footer-region div
        # therefore we manually appending it to where it supposed to be
        # since we delaying this action so that jqm has done its initiations
        # jqm refresh needs to delayed as well
        new_el = _.clone(@el)
        _.delay(->
            #remove EVERYTHING in footer-region first
            $("#footer-region").html('').append(new_el.outerHTML)
            $("#footer-region").enhanceWithin()
            #remove footer jqm created outside
            $("body > #footer").remove()
        , 30)

        @publishEvent('log:debug', 'FooterView:attach')
        @publishEvent 'jqm_footer_refersh:render'
