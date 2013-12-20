View = require 'views/edit-view'
mediator = require 'mediator'
module.exports = class AddView extends View
    initialize: (params) =>
        super
        # send url data from controler

    save_action: (url) =>
        super
        @publishEvent('log:info','commmit form')
        #run model and schema validation
        if _.isUndefined(@form.commit({validate:true}))
            @model.save({},{
                success:(event) =>
                    wait: true
                    if mediator.collections[@listing_type]?
                        # add it to collection so we don't need to use server ...
                        mediator.collections[@listing_type].add(@model)
                    @publishEvent 'tell_user', 'Rekord zapisany'
                    console.log(url)
                    # Chaplin.utils.redirectTo {url: url ? '/klienci'}
                error:(model, response, options) =>
                    if response.responseJSON?
                        Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                    else
                        Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'
            })
        else
            @publishEvent 'tell_user', 'Błąd w formularzu!'



