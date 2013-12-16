View = require 'views/edit-view'
mediator = require 'mediator'
module.exports = class View extends View
    initialize: (options) =>
        super
        # send url data from controler

    init_uploader: =>
        @uploader = new qq.FineUploaderBasic
            button: $("#avatar")[0]
            debug: true
            request:
                # endpoint: mediator.upload_url
                endpoint: 'http://localhost:8080/v1/pliki/dodaj'
                #params: {h: hash}
            callbacks:
                onSubmit : @onSubmit
                onComplete: @onComplete
            cors: # ALL requests are expected to be cross-domain requests
                expected: true
    onSubmit: =>
        console.log('submit')
    onComplete: =>
        console.log('compliete')


    save_action: =>
        super
        @publishEvent('log:info','commmit form')
        #run model and schema validation
        if _.isUndefined(@form.commit({validate:true}))
            @model.save({},{
                success:(event) =>
                    @publishEvent 'tell_user', 'Agent zaktualizowany'
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

