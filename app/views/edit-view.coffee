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
        # events
        @subscribeEvent('delete:clicked', @delete_action)
        @subscribeEvent('save:clicked', @save_action)
        @subscribeEvent('save-and-add:clicked', @save_and_add_action)

    delete_action: =>
        @publishEvent('log:info', 'delete  caught')
    save_action: =>
        @publishEvent('log:info', 'save_action  caught')
    save_and_add_action: =>
        @publishEvent('log:info', 'save_and_add_action  caught')

    get_form: =>
        @publishEvent('log:info', 1)
        @form = new Backbone.Form {

            model: @model
            template: _.template(localStorage.getObject('schemas')[@form_name])
            #templateData:{ }
        }
        @publishEvent('log:info', 2)
        window.form = @form
        @publishEvent('log:info', 3)
        @form.render()

    save_action: =>
        console.log('save_action caught')



    render: =>
        super
        #set the template context of @el to our rendered form - otherwise backbone.forms get out of context
        @get_form()
        @$el.append(@form.el)


    attach: =>
        super
        @publishEvent('log:info', 'view: clientadd afterRender()')
        @publishEvent 'jqm_refersh:render'


