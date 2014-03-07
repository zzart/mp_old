View = require 'views/edit-view'
mediator = require 'mediator'
module.exports = class ExportView extends View
    initialize: (options) =>
        super
        # @upload_multiple = false
        # send url data from controler

    save_action: (url) =>
        super
        @publishEvent('log:info','commmit form')
        #run model and schema validation
        if _.isUndefined(@form.commit({validate:true}))
            @model.save({},{
                success:(event) =>
                    if mediator.collections.exports?
                        # add it to collection so we don't need to use server ...
                        mediator.collections.exports.add(@model)
                    @publishEvent 'tell_user', "Rekord #{@model.get_url()} zapisany"
                    Chaplin.utils.redirectTo {url: url ? '/eksporty'}
                error:(model, response, options) =>
                    if response.responseJSON?
                        Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                    else
                        Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'
            })
        else
            @publishEvent 'tell_user', 'Błąd w formularzu!'

    refresh_form: =>
        Chaplin.utils.redirectTo {url: '/eksporty/dodaj'}

    delete_action: =>
        super
        @model.destroy
            success: (event) =>
                mediator.collections.exports.remove(@model)
                @publishEvent 'tell_user', "Rekord został usunięty"
                Chaplin.utils.redirectTo {url: '/eksporty'}
            error:(model, response, options) =>
                if response.responseJSON?
                    Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                else
                    Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'
    back_action: =>
        super
        Chaplin.utils.redirectTo {url: '/eksporty'}


    attach: =>
        super
        @publishEvent('log:info', 'view: export afterRender()')
        # so list items (resources) can be refreshed on time
        # _.delay(@refresh_resource,10)

