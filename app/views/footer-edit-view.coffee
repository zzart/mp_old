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
        @delegate 'click', '#save-and-add-button', @save_and_add

    save: (event) =>
        event.preventDefault()
        @publishEvent 'save:clicked'
    delete: (event) =>
        event.preventDefault()
        @publishEvent 'delete:clicked'
    save_and_add: (event) =>
        event.preventDefault()
        @publishEvent 'save_and_add:clicked'

    attach: =>
        super
        @publishEvent('log:info', 'FooterEditView:attach()')
        #@publishEvent 'jqm_page_refersh:render'
        @publishEvent 'jqm_footer_refersh:render'