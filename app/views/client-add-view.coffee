View = require 'views/base/view'
template = require 'views/templates/client_add_form'
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
        @model = mediator.models.client
        @template_form = template
        # events
        @delegate 'click', 'a#client-add-refresh', @refresh_form
        @delegate 'click', 'a#client-add-save', @save_form

        @form = new Backbone.Form {
            model: @model
            template: @template_form
            templateData:{heading: 'Dodaj kontrahenta'}
        }
        @form.render()

    save_form: =>
        @publishEvent('log:info','commmit form')
        #run model and schema validation
        if _.isUndefined(@form.commit({validate:true}))
            @model.save({},{
                success:(event) =>
                    if mediator.collections.clients?
                        # add it to collection so we don't need to use server ...
                        mediator.collections.clients.add(@model)
                    @publishEvent 'tell_user', 'Klient dodany'
                    Chaplin.helpers.redirectTo {url: '/klienci'}
                error:(model, response, options) =>
                    if response.responseJSON?
                        Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                    else
                        Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'
            })
        else
            @publishEvent 'tell_user', 'Błąd w formularzu!'

    refresh_form: =>
        Chaplin.helpers.redirectTo {url: '/klienci/dodaj'}

    render: =>
        super
        #set the template context of @el to our rendered form - otherwise backbone.forms get out of context
        @$el.append(@form.el)


    attach: =>
        super
        @publishEvent('log:info', 'view: clientadd afterRender()')
        @publishEvent 'clientaddview:render'


