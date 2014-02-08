View = require 'views/edit-view'
mediator = require 'mediator'
module.exports = class ClientAddView extends View
    initialize: (options) =>
        super
        # send url data from controler

    save_and_add_action: =>
        super
        @save_action('/klienci/dodaj')


    save_action: (url) =>
        super
        @publishEvent('log:info','commmit form')
        #run model and schema validation
        if _.isUndefined(@form.commit({validate:true}))
            @model.save({},{
                success:(event) =>
                    if mediator.collections.clients?
                        # add it to collection so we don't need to use server ...
                        mediator.collections.clients.add(@model)
                    @publishEvent 'tell_user', 'Klient zapisany'
                    Chaplin.utils.redirectTo {url: url ? '/klienci'}
                error:(model, response, options) =>
                    if response.responseJSON?
                        Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                    else
                        Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'
            })
        else
            @publishEvent 'tell_user', 'Błąd w formularzu!'

    refresh_form: =>
        Chaplin.utils.redirectTo {url: '/klienci/dodaj'}


    delete_action: =>
        super
        @model.destroy
            success: (event) =>
                mediator.collections.clients.remove(@model)
                @publishEvent 'tell_user', 'Klient został usunięty'
                Chaplin.utils.redirectTo {url: '/klienci'}
            error:(model, response, options) =>
                if response.responseJSON?
                    Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                else
                    Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'

    attach: =>
        super
        @publishEvent('log:info', 'view: clientadd afterRender()')


    back_action: =>
        super
        Chaplin.utils.redirectTo {url: '/klienci'}
