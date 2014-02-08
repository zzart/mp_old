View = require 'views/edit-view'
mediator = require 'mediator'
module.exports = class BranchView extends View
    initialize: (options) =>
        super

    save_action: =>
        super
        @publishEvent('log:info','commmit form')
        #run model and schema validation
        if _.isUndefined(@form.commit({validate:true}))
            @model.save({},{
                success:(event) =>
                    if mediator.collections.branches?
                        # add it to collection so we don't need to use server ...
                        mediator.collections.branches.add(@model)
                    @publishEvent 'tell_user', 'Oddział zapisany'
                    Chaplin.utils.redirectTo {url: '/oddzialy'}
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
        # TODO: oferty tego oddzaiłu do innego
        @model.destroy
            success: (event) =>
                mediator.collections.branches.remove(@model)
                @publishEvent 'tell_user', 'Oddział został usunięty'
                Chaplin.utils.redirectTo {url: '/oddzialy'}
            error:(model, response, options) =>
                if response.responseJSON?
                    Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                else
                    Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'

    back_action: =>
        super
        Chaplin.utils.redirectTo {url: '/oddzialy'}
