View = require 'views/edit-view'
upload_template = require 'views/templates/upload'
mediator = require 'mediator'
module.exports = class View extends View
    initialize: (options) =>
        super
        @publishEvent('log:info', 'edit vewq' )
        # @delegate('click','#avatar', @picture_add )
        #@delegate('click',"#upload", @remove_resource )
        @delegate('click',"[name='resources'] li a:first-child", @resource_preview )

    resource_preview:(e)=>
        e.preventDefault()
        console.log('preventing', e)
        img = new Image()
        img.src = 'images/file.png'
        $('#resource_preview').html(img.innerHTML).popup('open')

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
        self = @
        url = "http://localhost:8080/v1/pliki/#{itemEditor.value.uuid}"
        $.ajax(
            url: url
            beforeSend: (xhr) ->
                xhr.setRequestHeader('X-Auth-Token' , mediator.gen_token(url))
            type: "DELETE"
            success: (data, textStatus, jqXHR ) =>
                #lets delete this item from editor
                console.log('success', data, textStatus, jqXHR)
                items = self.form.fields.resources.getValue()
                new_items = []
                console.log('all itmes:', items, '  removing ' , itemEditor.value.uuid)
                for i in items
                    if i.uuid is itemEditor.value.uuid
                        self.form.fields.resources.editor.removeItem(i, items.indexOf(i))
                        console.log('removed:', i, items.indexOf(i))
            error: (jqXHR, textStatus, errorThrown) ->
                self.publishEvent("tell_user", errorThrown)
            #contentType: "application/json"
            # dataType: "json"
            # data: {"file": itemEditor.value.uuid}
        )

    init_sortable: =>
        self = @
        $("#resource_list").sortable
            stop: (event, ui) ->
                key = []
                sorted = []
                pattern = /.+\:\s/ #for better performance storing regx in variable
                $(@).children('li').find('p:last').each((i, str)->
                    # order of uuid will be our key for sorting so lets get the values
                    key.push(str.innerHTML.replace(pattern,''))
                )
                to_sort = self.form.fields.resources.getValue()
                if to_sort.length > 0
                    for i in to_sort
                        order = key.indexOf(i.uuid) + 1 #order doesn't have 0
                        i.order = order
                    console.log('getValue', self.form.fields.resources.getValue())

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

                onComplete: (id, filename, response, xmlhttprequest) ->
                    # self.publishEvent('log:debug', arguments)
                    if response.success is true
                        order = self.form.fields.resources.getValue().length
                        current_val =
                            # url:response.url
                            mime_type:response.mime_type
                            uuid:response.uuid
                            thumbnail:response.thumbnail
                            filename:response.filename
                            size: response.size
                            order:order + 1
                        self.form.fields.resources.editor.addItem(current_val)
                        self.publishEvent('log:info', "download complete #{arguments}")
                    else
                        self.publishEvent('log:info', "download failed #{arguments}")
                        self.publishEvent('tell_user', "Plik nie został pomyślnie przesłany na serwer ")

            cors: # ALL requests are expected to be cross-domain requests
                expected: true
            validation:
                # TODO: this in config
                # allowedExtensions: ['jpeg', 'jpg', 'png', 'gif', 'bmp', 'doc', 'odt', 'docx', 'pdf', 'txt', 'xml', 'csv', ]
                # TODO: this in config ? or price up ?
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
        @init_sortable()
