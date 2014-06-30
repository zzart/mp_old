template = require 'views/templates/footer_edit'
View = require 'views/base/view'

module.exports = class FooterView extends View
    template: template
    containerMethod : 'html'
    id: 'footer'
    attributes: { 'data-role':'footer', 'data-position':'fixed', 'data-theme':'b' }

    initialize: ->
        super
        @delegate 'click', '#delete-button', @delete
        @delegate 'click', '#save-button', @save
        @delegate 'click', '#back-button', @back

    save: (event) =>
        event.preventDefault()
        @publishEvent 'save:clicked'
    delete: (event) =>
        event.preventDefault()
        @publishEvent 'delete:clicked'
    back: (event) =>
        event.preventDefault()
        @publishEvent 'back:clicked'

    attach: =>
        super
        @publishEvent('log:debug', 'FooterView:attach()')
        #@publishEvent 'jqm_page_refersh:render'
        @publishEvent 'jqm_footer_refersh:render'
