View = require 'views/edit-view'
upload_template = require 'views/templates/upload'
mediator = require 'mediator'
module.exports = class View extends View
    initialize: (options) =>
        super
        @publishEvent('log:info', 'edit vewq' )
        # @delegate('click','#avatar', @picture_add )
        # send url data from controler

    picture_add: (e)=>
        e.preventDefault()
        console.log('adding pic')

    init_uploader: =>
        @$el.append(upload_template).then(
            # @uploader = new qq.FineUploaderBasic
            @uploader = new qq.FineUploader
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
            )

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
                    @publishEvent 'tell_user', 'Agent zapisany'
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

    attach: =>
        super
        @init_uploader()
