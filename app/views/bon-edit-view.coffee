View = require 'views/base/view'
template = require 'views/templates/bon_edit_form'
mediator = require 'mediator'
module.exports = class BonEditView extends View
    autoRender: true
    containerMethod: "html"
    attributes: { 'data-role':'content' }
    id: 'content'
    className: 'ui-content'
    initialize: (options) =>
        super
        # send url data from controler
        @params = options.params
        @model = mediator.models.bon
        @model.schema = mediator.models.user.get('schemas').company
        @template_form = template
        # only admin can edit this
        @can_edit = mediator.can_edit(mediator.models.user.get('is_admin'),1,0)
        # events
        @delegate 'click', 'a#bon-edit-delete', @delete_bon
        @delegate 'click', 'a#bon-edit-update', @save_form
        @delegate 'click', 'a.form-help', @form_help

        @form = new Backbone.Form {
            model: @model
            template: @template_form
            templateData:{
                heading: 'Edytuj dane biura nieruchomości'
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
                    @publishEvent 'tell_user', 'Dane biura zostały zaktualizowane'
                error:(model, response, options) =>
                    if response.responseJSON?
                        Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                    else
                        Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'
            })
        else
            @publishEvent 'tell_user', 'Błąd w formularzu!'

    delete_bon: =>
        @model.destroy
            success: (event) =>
                # we will never succeed....
                @publishEvent('log:info', 'dyspozycja usunięcia konta przyjęta' )
            error:(model, response, options) =>
                if response.responseJSON?
                    Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                else
                    Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'

    getTemplateData: =>
        super
        # client: @collection.toJSON()

    render: =>
        super
        #set the template context of @el to our rendered form - otherwise backbone.forms get out of context
        @$el.append(@form.el)


    attach: =>
        super
        @publishEvent('log:info', 'view: clientadd afterRender()')
        @publishEvent 'jqm_refersh:render'
        @publishEvent 'disable_form', @can_edit


