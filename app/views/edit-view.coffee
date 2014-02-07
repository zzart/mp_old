View = require 'views/base/view'
mediator = require 'mediator'
upload_template = require 'views/templates/upload'
module.exports = class EditView extends View
    autoRender: true
    containerMethod: "html"
    attributes: { 'data-role':'content' }
    id: 'content'
    className: 'ui-content'
    initialize: (params) =>
        super
        @params = params
        @model = @params.model
        @form_name = @params.form_name
        @can_edit = @params.can_edit
        @edit_type = @params.edit_type
        @listing_type = @params.listing_type ? false
        @delete_only = @params.delete_only ? false
        @publishEvent('log:debug', "form_name:#{@form_name}, can_edit:#{@can_edit}, listing_type:#{@listing_type}, delete_only:#{@delete_only} ")
        # events
        @subscribeEvent('delete:clicked', @delete_action)
        @subscribeEvent('popupbeforeposition', @popup_position)
        @subscribeEvent('save:clicked', @save_action)
        @subscribeEvent('save_and_add:clicked', @save_and_add_action)
        @delegate 'click', 'a.form-help', @form_help
        @delegate 'click', '[data-role=\'navbar\']:first li', @refresh_resource
        # @delegate('DOMSubtreeModified','#resource_list', @refresh_resource )
        @delegate('click',"[name='resources'] li a:first-child", @resource_preview )

    # resource --------------------------------------------
    popup_position:=>
        console.log('popup position fired')

    resource_preview:(e)=>
        e.preventDefault()
        uuid = e.target.id
        preview = e.target.dataset.preview
        @publishEvent("log:info", "#{uuid},#{preview}, #{e}")

        img = new Image()
        if preview is "true"
            img.src = "http://localhost:8080/v1/pliki/#{uuid}/#{mediator.models.user.get('company_name')}"
        else
            img.src = "images/file.png" # localhost:3333
            # img.height = '100'
            # img.width = '100'
        button = "<a href='#' data-rel='back' class='ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-delete ui-btn-icon-notext ui-btn-right'>Zamknij</a>"
        save_button = "<a href='http://localhost:8080/v1/pliki/#{uuid}/#{mediator.models.user.get('company_name')}?download=true' class='ui-btn ui-btn-inline'>Zapisz na dysku</a>"
        element = "#{button}#{img.outerHTML}<br />#{save_button}"
        setTimeout(->
            $('#resource_preview').html(element).popup('open')
        , 1000)

    init_events: =>
        @editor = @form.fields.resources.editor
        # @editor.on('remove', @remove_resources)
        @editor.on('add', @refresh_resource)
        @delegate 'click', '[data-action=\'remove\']', @remove_resources_click

    refresh_resource: =>
        @publishEvent("log:debug", "refresh_resource")
        $ul = $("#resource_list")
        $li = $("#resource_list li")
        @publishEvent("log:debug", "marked: #{$ul}#{$li}")
        # DOMSubtreeModified(don't have it anymore but still...) fires after save so jqm throws refresh errors
        try
            $ul.listview "refresh"
            $ul.trigger "updatelayout"
        catch error
            @publishEvent("log:warn", error)

    remove_resources_click:(e) =>
        # we need to show the privilleged user dialog
        # and hold removing item for non privilleged user who wants to delete but shoudn't
        self = @
        e.preventDefault()
        @uuid = e.target.id
        $("#confirm").popup('open')
        # unbind is for stopping it firing multiple times
        $("#confirmed").unbind().click =>
            self.remove_resources(@uuid)

    remove_resources:(uuid) =>

        # fineuploader doesn't support deleting files later then directly after upload
        # so need to do this by hand
        self = @
        url = "http://localhost:8080/v1/pliki/#{uuid}"
        $.ajax(
            url: url
            beforeSend: (xhr) ->
                xhr.setRequestHeader('X-Auth-Token' , mediator.gen_token(url))
            type: "DELETE"
            success: (data, textStatus, jqXHR ) =>
                #lets delete this item from editor
                # console.log('success', data, textStatus, jqXHR)
                items = self.form.fields.resources.getValue()
                new_items = []
                # console.log('all itmes:', items, '  removing ' , uuid)
                for i in items
                    if i.uuid is uuid
                        # console.log('removed:', i, items.indexOf(i))
                        self.form.fields.resources.editor.removeItem(i, items.indexOf(i))
            error: (jqXHR, textStatus, errorThrown ) ->
                self.publishEvent("tell_user", jqXHR.responseJSON.title or errorThrown)
            #contentType: "application/json"
            # dataType: "json"
            # data: {"file": itemEditor.value.uuid}
        )
    _remove_resources:(listEditor, itemEditor, extra) =>

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
                # console.log('success', data, textStatus, jqXHR)
                items = self.form.fields.resources.getValue()
                new_items = []
                # console.log('all itmes:', items, '  removing ' , itemEditor.value.uuid)
                for i in items
                    if i.uuid is itemEditor.value.uuid
                        self.form.fields.resources.editor.removeItem(i, items.indexOf(i))
                        # console.log('removed:', i, items.indexOf(i))
            error: (jqXHR, textStatus, errorThrown ) ->
                self.publishEvent("tell_user", jqXHR.responseJSON.title or errorThrown)
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
                #for better performance storing regx in variable
                pattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/
                # migth be better /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/
                $(@).children('li').find('a:first').each((i, str)->
                    # order of uuid will be our key for sorting so lets get the values
                    key.push(str.innerHTML.match(pattern)[0])
                )
                to_sort = self.form.fields.resources.getValue()
                if to_sort.length > 0
                    for i in to_sort
                        order = key.indexOf(i.uuid) + 1 #order doesn't have 0
                        i.order = order
                        # console.log(key, i.uuid, key.indexOf(i.uuid))
                        # console.log('getValue', self.form.fields.resources.getValue())

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
                        self.form.fields.resources.editor.addItem(current_val, true) # SECOUND PARAM NEEDS TO BE TRUE TO TRIGGER ADD EVENT!!!!
                        self.publishEvent('log:info', "download complete #{arguments}")
                    else
                        self.publishEvent('log:info', "download failed #{arguments}")
                        self.publishEvent('tell_user', "Plik nie został pomyślnie przesłany na serwer ")

            cors: # ALL requests are expected to be cross-domain requests
                expected: true
            validation:
                # TODO: this in config ? or price up ?
                sizeLimit: 2048000 #  2000 kB = 2000 * 1024 bytes
                # TODO: this in config
                # allowedExtensions: ['jpeg', 'jpg', 'png', 'gif', 'bmp', 'doc', 'odt', 'docx', 'pdf', 'txt', 'xml', 'csv', ]
                # deleteFile:
                #     enabled: true
                #     forceConfirm: true
                #     endpoint: 'http://localhost:8080/v1/pliki'
                # window.uploader = @uploader
    # resource end --------------------------------------------

    form_help:(event) =>
        @publishEvent 'tell_user' , event.target.text

    delete_action: =>
        @publishEvent('log:info', 'delete  caught')
    save_action: (url) =>
        @publishEvent('log:info', 'save_action  caught')
    save_and_add_action: =>
        @publishEvent('log:info', 'save_and_add_action  caught')

    get_form: =>
        @publishEvent('log:info',"form name: #{@form_name}")
        window.model = @model
        # console.log(@model.schema)
        # console.log(@model.schema.type)
        #@form = new Backbone.Form
        @form = new Backbone.Form
            model:  @model
            template: _.template(localStorage.getObject(@form_name))
            #templateData:{ }

        window.form = @form
        @form.render()

    save_action: =>
        @publishEvent('log:debug', 'save_action caugth')


    render: =>
        super
        @publishEvent('log:info', 'view: edit-view beforeRender()')
        #we want to override render method higher if it's listing stuff
        if not @form_name.match('rent|sell')
        #set the template context of @el to our rendered form - otherwise backbone.forms get out of context
            @get_form()
            @$el.append(@form.el)
            # console.log(@$el, @form.el, @template, @form_name)
            @publishEvent('log:info', 'view: edit-view RenderEnd()')


    attach: =>
        super
        @publishEvent('log:info', 'view: edit-view afterRender()')
        @publishEvent 'disable_buttons', @can_edit ? False , @edit_type, @delete_only
        #move listing inints into listing view
        if not @form_name.match('rent|sell')
            # init resources when they are needed
            if _.isObject(@model.schema.resources)
                @init_events()
                @init_uploader()
                @init_sortable()
        @publishEvent 'jqm_refersh:render'
