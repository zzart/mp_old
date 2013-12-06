View = require 'views/base/view'
template = require 'views/templates/branch_form'
mediator = require 'mediator'
module.exports = class BranchEditView extends View
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
        @model = mediator.collections.branches.get(@params.id)
        @model.schema = mediator.models.user.get('schemas').branch
        @template_form = template
        # events
        @delegate 'click', 'a#branch-edit-delete', @delete
        @delegate 'click', 'a#branch-edit-update', @save_form
        @delegate 'click', 'a.form-help', @form_help

        @form = new Backbone.Form {
            model: @model
            template: @template_form
            templateData:{
                heading: 'Edytuj oddział'
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
                    @publishEvent 'tell_user', 'Oddział zaktualizowany'
                    Chaplin.helpers.redirectTo {url: '/oddzialy'}
                error:(model, response, options) =>
                    if response.responseJSON?
                        Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                    else
                        Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'
            })
        else
            @publishEvent 'tell_user', 'Błąd w formularzu!'

    delete: =>
        # TODO: oferty tego oddzaiłu do innego
        @model.destroy
            success: (event) =>
                mediator.collections.branches.remove(@model)
                @publishEvent 'tell_user', 'Oddział został usunięty'
                Chaplin.helpers.redirectTo {url: '/oddzialy'}
            error:(model, response, options) =>
                if response.responseJSON?
                    Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                else
                    Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'

    render: =>
        super
        #set the template context of @el to our rendered form - otherwise backbone.forms get out of context
        @publishEvent('log:info', '5')
        @$el.append(@form.el)
        @publishEvent('log:info', '22')


    attach: =>
        super
        @publishEvent('log:info', '6')
        @publishEvent('log:info', 'view: clientadd afterRender()')
        @publishEvent 'jqm_refersh:render'

