template = require 'views/templates/footer_list'
View = require 'views/base/view'

module.exports = class FooterView extends View
    template: template
    containerMethod : 'html'
    id: 'footer'
    # this creates footer bar ... we want to max out on number of items so don't need it anymore
    #attributes: { 'data-role':'footer', 'data-position':'fixed' , 'data-theme':'b' }
    attach: =>
        super
        @publishEvent('log:info', 'FooterView:attach')
        #@publishEvent 'jqm_page_refersh:render'
        @publishEvent('jqm_footer_refersh:render')
