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
        @can_edit = mediator.can_edit(mediator.models.user.get('is_admin'),@model.get('id'), mediator.models.user.get('id'))

        @form = new Backbone.Form
            model: @model
            template: @template_form
            templateData:
                heading: 'Edytuj agenta'
                mode: 'edit'
                is_admin: mediator.models.user.get('is_admin')
                can_edit: @can_edit

        @form.render()


    init_uploader: =>
        @uploader = new qq.FineUploaderBasic
            button: $("#avatar")[0]
            debug: true
            request:
                # endpoint: mediator.upload_url
                endpoint: 'http://localhost:8080/v1/pliki/dodaj'
                #params: {h: hash}
            callbacks:
                onSubmit : @onSubmit
                onComplete: @onComplete
            cors: # ALL requests are expected to be cross-domain requests
                expected: true
    onSubmit: =>
        console.log('submit')
    onComplete: =>
        console.log('compliete')

    form_help:(event) =>
        @publishEvent 'tell_user' , event.target.text

    save_form: =>
        @publishEvent('log:info','commmit form')
        #run model and schema validation
        if _.isUndefined(@form.commit({validate:true}))
            @model.save({},{
                success:(event) =>
                    @publishEvent 'tell_user', 'Agent zaktualizowany'
                    Chaplin.utils.redirectTo {url: '/agenci'}
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
                Chaplin.utils.redirectTo {url: '/agenci'}
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
        @init_uploader()
        @publishEvent('log:info', 'view: agentadd afterRender()')
        @publishEvent 'jqm_refersh:render'
        @publishEvent 'disable_form', @can_edit


