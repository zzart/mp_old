View = require 'views/edit-view'
mediator = require 'mediator'
module.exports = class View extends View
    initialize: (options) =>
        super
        @publishEvent('log:debug', 'edit view' )

    save_action: =>
        @publishEvent('log:debug', 'custom save_action  caught')
        @publishEvent('log:debug','commmit form')
        #run model and schema validation
        if _.isUndefined(@form.commit({validate:true}))
            @model.save({},{
                success:(event) =>
                    @publishEvent 'tell_user', "Rekord #{@model.get_url()} zapisany"
                    # hasChanged doesn't work since we setting values again after save
                    if @model.id == mediator.models.user.get('id') and (
                        @model.get(['username']) isnt mediator.models.user.get('username') or
                        @model.get(['password']) isnt mediator.models.user.get('user_pass') )
                        @publishEvent("log:debug", "password/username changed relogin required")
                        mediator.models.user.clear()
                        Chaplin.utils.redirectTo {url: '/login'}
                    else
                        Chaplin.utils.redirectTo @route_params[1]['previous']['name'], @route_params[1]['previous']['params']
                error:(model, response, options) =>
                    if response.responseJSON?
                        Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                    else
                        Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'
            })
        else
            @publishEvent 'tell_user', 'Błąd w formularzu! Pola zaznaczone pogrubioną czcionką należy wypełnić.'

    attach: =>
        super
        # disable admin setting for normal users
        if mediator.models.user.get('is_admin') is false
            $("[data-fields='is_admin'] select").slider('disable')
