View = require 'views/edit-view'
mediator = require 'mediator'
module.exports = class ClientView extends View
    initialize: (options) =>
        super

#NOTE: admini modyfikując rekord automatycznie zmieniają jego autora ! Pozwalamy więc tylko na kasowanie!
    delete_action: =>
        super
        @model.destroy
            success: (event) =>
                mediator.collections.clients_public.remove(@model)
                @publishEvent 'tell_user', 'Klient został usunięty'
                Chaplin.utils.redirectTo {url: '/klienci-wspolni'}
            error:(model, response, options) =>
                if response.responseJSON?
                    Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                else
                    Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'

    back_action: =>
        super
        Chaplin.utils.redirectTo {url: '/klienci-wspolni'}
