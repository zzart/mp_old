View = require 'views/edit-view'
mediator = require 'mediator'
module.exports = class View extends View
    initialize: (options) =>
        super
        @publishEvent('log:info', 'edit vewq' )

    save_action: =>
        super
        @publishEvent('log:info','commmit form')
        #run model and schema validation
        if _.isUndefined(@form.commit({validate:true}))
            @model.save({},{
                success:(event) =>
                    @publishEvent 'tell_user', 'Agent zapisany'
                    # hasChanged doesn't work since we setting values again after save
                    if @model.id == mediator.models.user.get('id') and (
                        @model.get(['username']) isnt mediator.models.user.get('username') or
                        @model.get(['password']) isnt mediator.models.user.get('user_pass') )
                        @publishEvent("log:info", "password/username changed relogin required")
                        mediator.models.user.clear()
                        Chaplin.utils.redirectTo {url: '/login'}
                    else
                        Chaplin.utils.redirectTo {url: '/agenci'}
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
        # TODO: przepisać oferty , kontakty etc...
        @model.destroy
            success: (event) =>
                mediator.collections.agents.remove(@model)
                @publishEvent 'tell_user', 'Agent został usunięty'
                Chaplin.utils.redirectTo {url: '/agenci'}
            error:(model, response, options) =>
                if response.responseJSON?
                    Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                else
                    Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'

    back_action: =>
        super
        Chaplin.utils.redirectTo {url: '/agenci'}

    attach: =>
        super
