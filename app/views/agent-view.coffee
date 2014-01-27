View = require 'views/edit-view'
upload_template = require 'views/templates/upload'
mediator = require 'mediator'
module.exports = class View extends View
    initialize: (options) =>
        super
        @publishEvent('log:info', 'edit vewq' )
        # @delegate('click','#avatar', @picture_add )
        #@delegate('click',"#upload", @remove_resource )
        #@delegate('click',"#uploader_button", @remove_resource )

    remove_resource:(e)=>
        e.preventDefault()
        console.log('preventing')

    init_events: =>
        @editor = @form.fields.resources.editor
        @editor.on('remove', @remove_resources)
        #@editor.on('change', ->
        #    console.log('change'))
        #@editor.on('all', ->
        #    console.log('all'))
        #@editor.on('add', ->
        #    console.log('add'))
            #listen:
            #    'remove editor': ->  console.log('aa')
            #    'remove form': ->  console.log('aa')
            #    'uuid:remove editor': ->  console.log('aa')
            #    'uuid:remove form': ->  console.log('aa')
    remove_resources:(listEditor, itemEditor, extra) =>
        # fineuploader doesn't support deleting files later then directly after upload
        # so need to do this by hand
        $.ajax(
            url:"http://localhost:8080/v1/pliki/"
            # url:"http://localhost:8080/v1/pliki/#{itemEditor.value.uuid}"
            beforeSend: (xhr) ->
                xhr.setRequestHeader('X-Auth-Token' , mediator.gen_token('http://localhost:8080/v1/pliki'))
            type: "DELETE"
            contentType: "application/json"
            dataType: "json"
            data: {"file": itemEditor.value.uuid}
        )


    init_uploader: =>
        self = @
        @$el.append(upload_template)
        #$("#upload").fineUploader
        @uploader = new qq.FineUploader
            #button: $("#uploader_button")[0]
            #debug: true
            element: $("#upload")[0]
            request:
                # endpoint: mediator.upload_url
                endpoint: 'http://localhost:8080/v1/pliki'
                customHeaders: {'X-Auth-Token':mediator.gen_token('http://localhost:8080/v1/pliki')}
                #params: {h: hash}
            callbacks:
                onSubmit: (e) ->
                    self.publishEvent('log:info', "download submitted #{e}")

                onComplete: (response_code, filename, response, xmlhttprequest) ->
                    self.publishEvent('log:debug', arguments)
                    order = self.form.fields.resources.getValue().length
                    current_val =
                        url:response.url
                        mime_type:response.mime_type
                        uuid:response.uuid
                        thumbnail:response.thumbnail
                        filename:response.filename
                        filesize: response.filesize
                        order:order + 1
                    self.form.fields.resources.editor.addItem(current_val)
                    self.publishEvent('log:info', "download complete #{arguments}")
            cors: # ALL requests are expected to be cross-domain requests
                expected: true
            validation:
                allowedExtensions: ['jpeg', 'jpg', 'png', 'gif', 'bmp']
                sizeLimit: 2048000 #  2000 kB = 2000 * 1024 bytes
                # deleteFile:
                #     enabled: true
                #     forceConfirm: true
                #     endpoint: 'http://localhost:8080/v1/pliki'
        window.uploader = @uploader

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
        @init_events()
        @init_uploader()
