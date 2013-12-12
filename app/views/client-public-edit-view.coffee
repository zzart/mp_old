View = require 'views/base/view'
#NOTE: admini modyfikując rekord automatycznie zmieniają jego autora ! Pozwalamy więc tylko na kasowanie!
template = require 'views/templates/client_public_form'
mediator = require 'mediator'
module.exports = class ClientEditView extends View
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
        @model = mediator.collections.clients_public.get(@params.id)
        @model.schema = mediator.models.user.get('schemas').client
        @template_form = template
        @can_edit = mediator.can_edit(mediator.models.user.get('is_admin'),@model.get('agent'), mediator.models.user.get('id'))
        # events
        @delegate 'click', 'a#client-edit-delete', @delete_client
        @delegate 'click', 'a#client-edit-update', @save_form
        @delegate 'click', 'a.form-help', @form_help
        #@on 'addedToDOM', @disable_form


        @form = new Backbone.Form {
            model: @model
            template: @template_form
            templateData:{
                heading: 'Edytuj kontrahenta'
                mode: 'edit'
                can_edit: @can_edit
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
                    @publishEvent 'tell_user', 'Klient zaktualizowany'
                    Chaplin.helpers.redirectTo {url: '/klienci-wspolni'}
                error:(model, response, options) =>
                    if response.responseJSON?
                        Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                    else
                        Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'
            })
        else
            @publishEvent 'tell_user', 'Błąd w formularzu!'

    delete_client: =>
        @model.destroy
            success: (event) =>
                mediator.collections.clients_public.remove(@model)
                @publishEvent 'tell_user', 'Klient został usunięty'
                Chaplin.helpers.redirectTo {url: '/klienci-wspolni'}
            error:(model, response, options) =>
                if response.responseJSON?
                    Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                else
                    Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'

    render: =>
        super
        #set the template context of @el to our rendered form - otherwise backbone.forms get out of context
        @publishEvent('log:info', 'view: clientedit render()')
        @$el.append(@form.el)


    attach: =>
        super
        @publishEvent('log:info', 'view: clientedit afterRender()')
        @publishEvent 'jqm_refersh:render'
        #disable_form needs to be called after jqm_refersh
        @publishEvent 'disable_form', @can_edit


