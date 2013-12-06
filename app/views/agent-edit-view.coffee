View = require 'views/base/view'
template = require 'views/templates/agent_form'
mediator = require 'mediator'
module.exports = class EditView extends View
    autoRender: true
    containerMethod: "html"
    attributes: { 'data-role':'content' }
    id: 'content'
    className: 'ui-content'
    initialize: (options) =>
        super
        # send url data from controler
        @params = options.params
        @publishEvent('log:info', console.log(@params))
        @model = mediator.collections.agents.get(@params.id)
        @model.schema = mediator.models.user.get('schemas').agent
        @template_form = template
        # events
        @delegate 'click', 'a#agent-edit-delete', @delete_agent
        @delegate 'click', 'a#agent-edit-update', @save_form
        @delegate 'click', 'a.form-help', @form_help

        @form = new Backbone.Form {
            model: @model
            template: @template_form
            templateData:{
                heading: 'Edytuj agenta'
                mode: 'edit'
                is_admin: mediator.models.user.get('is_admin')
            }
        }
        @form.render()

    form_help:(event) =>
        @publishEvent 'tell_user' , event.target.text

    save_form: =>
        @publishEvent('log:info','commmit form')
        #run model and schema validation
        if _.isUndefined(@form.commit({validate:true}))
            @model.save({},{
                success:(event) =>
                    @publishEvent 'tell_user', 'Agent zaktualizowany'
                    Chaplin.helpers.redirectTo {url: '/agenci'}
                error:(model, response, options) =>
                    if response.responseJSON?
                        Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                    else
                        Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'
            })
        else
            @publishEvent 'tell_user', 'Błąd w formularzu!'

    delete_agent: =>
        # TODO: przepisać oferty , kontakty etc...
        @model.destroy
            success: (event) =>
                mediator.collections.agents.remove(@model)
                @publishEvent 'tell_user', 'Agent został usunięty'
                Chaplin.helpers.redirectTo {url: '/agenci'}
            error:(model, response, options) =>
                if response.responseJSON?
                    Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                else
                    Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'

    render: =>
        super
        #set the template context of @el to our rendered form - otherwise backbone.forms get out of context
        @$el.append(@form.el)


    attach: =>
        super
        @publishEvent('log:info', 'view: agentadd afterRender()')
        @publishEvent 'jqm_refersh:render'


