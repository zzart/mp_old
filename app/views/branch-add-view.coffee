View = require 'views/base/view'
template = require 'views/templates/branch_form'
mediator = require 'mediator'
module.exports = class ClientAddView extends View
    autoRender: true
    containerMethod: "html"
    attributes: { 'data-role':'content' }
    id: 'content'
    className: 'ui-content'
    initialize: (options) =>
        super
        # send url data from controler
        @params = options.params
        @model = mediator.models.branch
        @template_form = template
        # events
        @delegate 'click', 'a#branch-add-refresh', @refresh_form
        @delegate 'click', 'a#branch-add-save', @save_form
        @delegate 'click', 'a.form-help', @form_help

        @form = new Backbone.Form {
            model: @model
            template: @template_form
            templateData:{
                heading: 'Dodaj oddział'
                mode: 'add'
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
                    if mediator.collections.branches?
                        # add it to collection so we don't need to use server ...
                        mediator.collections.branches.add(@model)
                    @publishEvent 'tell_user', 'Oddział dodany'
                    Chaplin.utils.redirectTo {url: '/oddzialy'}
                error:(model, response, options) =>
                    if response.responseJSON?
                        Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                    else
                        Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'
            })
        else
            @publishEvent 'tell_user', 'Błąd w formularzu!'

    refresh_form: =>
        render()

    render: =>
        super
        #set the template context of @el to our rendered form - otherwise backbone.forms get out of context
        @$el.append(@form.el)


    attach: =>
        super
        @publishEvent('log:info', 'view: clientadd afterRender()')
        @publishEvent 'jqm_refersh:render'


