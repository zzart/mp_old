View = require 'views/base/view'
mediator = require 'mediator'
module.exports = class EditView extends View
    autoRender: true
    containerMethod: "html"
    attributes: { 'data-role':'content' }
    id: 'content'
    className: 'ui-content'
    initialize: (params) =>
        super
        @params = params
        @model = @params.model
        @form_name = @params.form_name
        @can_edit = @params.can_edit
        @edit_type = @params.edit_type
        @listing_type = @params.listing_type ? false
        @delete_only = @params.delete_only ? false
        # events
        @subscribeEvent('delete:clicked', @delete_action)
        @subscribeEvent('save:clicked', @save_action)
        @subscribeEvent('save_and_add:clicked', @save_and_add_action)
        @delegate 'click', 'a.form-help', @form_help

    form_help:(event) =>
        @publishEvent 'tell_user' , event.target.text

    delete_action: =>
        @publishEvent('log:info', 'delete  caught')
    save_action: (url) =>
        @publishEvent('log:info', 'save_action  caught')
    save_and_add_action: =>
        @publishEvent('log:info', 'save_and_add_action  caught')

    get_form: =>
        @publishEvent('log:info', @form_name)
        window.model = @model
        @form = new Backbone.Form
            model: @model
            template: _.template(localStorage.getObject('forms')[@form_name])
            #templateData:{ }

        window.form = @form
        @form.render()

    save_action: =>
        console.log('save_action caught')


    render: =>
        super
        @publishEvent('log:info', 'view: edit-view beforeRender()')
        #set the template context of @el to our rendered form - otherwise backbone.forms get out of context
        @get_form()
        @$el.append(@form.el)
        @publishEvent('log:info', 'view: edit-view RenderEnd()')


    attach: =>
        super
        @publishEvent('log:info', 'view: edit-view afterRender()')
        @publishEvent 'jqm_refersh:render'
        @publishEvent 'disable_buttons', @can_edit ? False , @edit_type, @delete_only


