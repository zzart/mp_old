View = require 'views/edit-view'
mediator = require 'mediator'
module.exports = class BonEditView extends View
    initialize: (options) =>
        super

    save_action: =>
        super
        @publishEvent('log:info','commmit form')
        #run model and schema validation
        if _.isUndefined(@form.commit({validate:true}))
            @model.save({},{
                success:(event) =>
                    @publishEvent 'tell_user', "Dane biura zostały zmienione #{@model.get_url()} zapisany"
                error:(model, response, options) =>
                    if response.responseJSON?
                        Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                    else
                        Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'
            })
        else
            @publishEvent 'tell_user', 'Błąd w formularzu!'

    delete_action: =>
        super
        @model.destroy
            success: (event) =>
                # we will never succeed....
                @publishEvent('log:info', 'Dyspozycja usunięcia konta przyjęta. Skontaktujemy się z państwem w celu potwierdzenia.' )
            error:(model, response, options) =>
                if response.responseJSON?
                    Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                else
                    Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'

    attach: =>
        super
        @publishEvent('log:info', 'view: bon-view afterRender()')
        # remove back_button
        # disable_button fires twice but what do i care ;)
        @publishEvent 'disable_buttons', @can_edit ? false , @edit_type, false, true
