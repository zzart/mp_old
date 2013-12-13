View = require 'views/base/view'
template = require 'views/templates/property_form'
mediator = require 'mediator'
module.exports = class PropertyAddView extends View
    autoRender: true
    containerMethod: "html"
    attributes: { 'data-role':'content' }
    id: 'content'
    className: 'ui-content'
    initialize: (options) =>
        super
        # send url data from controler
        @params = options.params
        @model = mediator.models.property
        @template_form = template
        # events
        # @delegate 'click', 'a#branch-add-refresh', @refresh_form
        # @delegate 'click', 'a#branch-add-save', @save_form
        # @delegate 'click', 'a.form-help', @form_help
        @delegate 'click', '#bone', @tabs
        @delegate 'click', '#btwo', @tabs
        @delegate 'click', '#bthree', @tabs


        @form = new Backbone.Form {
            model: @model
            template: _.template(mediator.models.user.get('schemas').mieszkania_form)
            templateData:{
                heading: 'Dodaj mieszkanie'
                mode: 'add'
                is_admin: mediator.models.user.get('is_admin')
            }
        }
        window.form = @form
        @form.render()

    tabs: (event) =>
        event.preventDefault()
        console.log('click')

        # form_help:(event) =>
        #     @publishEvent 'tell_user' , event.target.text

        # save_form: =>
        #     @publishEvent('log:info','commmit form')
        #     #run model and schema validation
        #     if _.isUndefined(@form.commit({validate:true}))
        #         @model.save({},{
        #             success:(event) =>
        #                 if mediator.collections.property?
        #                     # add it to collection so we don't need to use server ...
        #                     mediator.collections.property.add(@model)
        #                 @publishEvent 'tell_user', 'Oddział dodany'
        #                 Chaplin.utils.redirectTo {url: '/oddzialy'}
        #             error:(model, response, options) =>
        #                 if response.responseJSON?
        #                     Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
        #                 else
        #                     Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'
        #         })
        #     else
        #         @publishEvent 'tell_user', 'Błąd w formularzu!'

        # refresh_form: =>
        #     render()

    render: =>
        super
        #set the template context of @el to our rendered form - otherwise backbone.forms get out of context
        @$el.append(@form.el)


    attach: =>
        super
        @publishEvent('log:info', 'view: clientadd afterRender()')
        @publishEvent 'jqm_refersh:render'


