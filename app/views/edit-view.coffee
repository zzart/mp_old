View = require 'views/base/view'
mediator = require 'mediator'
upload_template = require 'views/templates/upload'
EditPanelView = require 'views/edit-panel-view'
Omap = require 'views/openmap'

module.exports = class EditView extends View
    autoRender: true
    containerMethod: "html"
    #attributes: { 'data-role':'content' }
    id: 'content'
    className: 'ui-content'
    initialize: (params) =>
        super
        @params = params
        @route_params = @params.route_params ? false
        @model = @params.model
        @model.schema = @model.get_schema()
        @form_name = @model.get_form_name()
        @edit_panel_template = @model.get_form_name()
        @listing_type = @params.listing_type ? false
        @delete_only = @params.delete_only ? false
        @upload_multiple = true
        @edit_panel_rendered = false
        @tab_id = 'tab_1'
        @publishEvent('log:debug', "form_name:#{@form_name}, listing_type:#{@listing_type}, delete_only:#{@delete_only} ")
        # events
        @subscribeEvent('edit_panel:show_to_client', @show_to_client)
        @subscribeEvent('edit_panel:show_history', @show_history)
        @subscribeEvent('header:change_tab', @change_tab)

        @subscribeEvent('delete:clicked', @delete_action)
        @subscribeEvent('popupbeforeposition', @popup_position)
        @subscribeEvent('save:clicked', @save_action)
        @subscribeEvent('back:clicked', @back_action)
        @delegate 'keyup', '[name=\'prowizja_procent\']', @calculate_percent
        @delegate 'keyup', '[name=\'cena\']', @calculate_percent
        @delegate 'click', 'a.form-help', @form_help
        @delegate 'click', 'a.form-link', @form_link
        @delegate 'click', '[data-role=\'navbar\']:first li', @refresh_resource
        # @delegate('DOMSubtreeModified','#resource_list', @refresh_resource )
        @delegate('click',"[name='resources'] li a:first-child", @resource_preview )

        # --- debug
        window._model = @model if mediator.online is false
        window._route_params = @route_params if mediator.online is false
        window._tab_id = @current_tab() if mediator.online is false


    calculate_percent: =>
        @publishEvent("log:debug", "calculate percent")
        price = parseFloat($('[name=\'cena\']').val())
        percent = parseFloat($('[name=\'prowizja_procent\']').val())
        result = price * (percent/100)
        $('[name=\'prowizja_kwota\']').val(result.toFixed(2))

    show_to_client: (e) =>
        @publishEvent("log:debug", "show_to_client cought")

    show_history: (e) =>
        @publishEvent("log:debug", "show_history cought")
        if @model.isNew() is false
            response = @mp_request(@model, "#{mediator.server_url}v1/historie/#{@model.get('id')}/#{@model.module_name[1]}", "GET", "Historia została pobrana", "Historia obiektu nie została pobrana lub nie istnieje", false)
            if response.responseText?
                r = JSON.parse(response.responseText)
                if _.has(r, 'historia')
                    li = ""
                    for line in r['historia']
                        li = "#{li}<li>#{line}</li>"
                    form = "<h3>Historia obiektu ##{@model.get('id')}</h3><ul>#{li}</ul><button data-icon='check' id='im_done'>OK</button>"
                else
                    form = "<h3>Historia obiektu ##{@model.get('id')}</h3>Nic nie znaleziono <br /> <button data-icon='check' id='im_done'>OK</button>"
                try
                    $('#popgeneric').html(form).enhanceWithin()
                catch error
                    @publishEvent("log:warn", error)
                $('#popgeneric').popup('open',{ transition:"fade" })
                # # unbind is for stopping it firing multiple times
                $("#im_done").unbind().click (e)->
                    e.preventDefault()
                    $('#popgeneric').popup('close')
                    $(@).off('click')


    # resource --------------------------------------------
    popup_position:=>
        @publishEvent("log:debug", "popup positon fired")

    resource_preview:(e)=>
        e.preventDefault()
        uuid = false # reset
        uuid = e.target.id
        # if user clicks on img then we don't have all data required. Let's force them to click on main content link only
        if uuid
            preview = e.target.dataset.preview
            @publishEvent("log:info", "#{uuid},#{preview}, #{e}")
            img = new Image()
            if preview is "true"
                img.src = "#{mediator.upload_url}/#{uuid}/#{mediator.models.user.get('company_name')}"
            else
                img.src = "images/file.png" # localhost:3333
                # img.height = '100'
                # img.width = '100'
            button = "<a href='#' data-rel='back' class='ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-delete ui-btn-icon-notext ui-btn-right'>Zamknij</a>"
            save_button = "<a href='#{mediator.upload_url}/#{uuid}/#{mediator.models.user.get('company_name')}?download=true' class='ui-btn ui-btn-inline'>Zapisz na dysku</a>"
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

        # set button to disabled if we allowing only one upload per element
        @publishEvent("log:info",  "resources empty: #{_.isEmpty(@form.fields.resources.editor.getValue())}")
        if @upload_multiple is false and not _.isEmpty(@form.fields.resources.editor.getValue())
            @publishEvent("log:info", "one upload allowed  - removing button ")
            $("#upload a:first").addClass('ui-state-disabled')
            $("#upload input").css('display', 'none')
        else # make sure we back to normal
            @publishEvent("log:info", "upload allowed  - reseting button")
            $("#upload a:first").removeClass('ui-state-disabled')
            $("#upload input").css('display', 'inline')

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
        url = "#{mediator.upload_url}/#{uuid}"
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
                self.refresh_resource()
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
            multiple: self.upload_multiple
            request:
                # endpoint: mediator.upload_url
                endpoint: "#{mediator.upload_url}"
                customHeaders: {'X-Auth-Token':mediator.gen_token("#{mediator.upload_url}")}
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
                        # SECOUND PARAM NEEDS TO BE TRUE TO TRIGGER ADD EVENT!!!!
                        self.form.fields.resources.editor.addItem(current_val, true)
                        self.publishEvent('log:info', "download complete #{arguments}")
                    else
                        # In case we need to tell user sth specyfic ie. (run out of space etc.)
                        # need to be able to check for server msg first and then default ...
                        console.log(xmlhttprequest)
                        try
                            self.publishEvent('log:error', "download failed.")
                            self.publishEvent('log:error', xmlhttprequest.response)
                            resp = JSON.parse(xmlhttprequest.response)
                            self.publishEvent('tell_user', "Plik nie został pomyślnie przesłany na serwer. #{resp.title} ")
                        catch error
                            self.publishEvent('log:error', error)
                            self.publishEvent('tell_user', "Plik nie został pomyślnie przesłany na serwer.")

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
        # append photo capture to button
        $('#upload input')[0].setAttribute('capture', 'camera')
        $('#upload input')[0].setAttribute('accept', 'image/*')

    # resource end --------------------------------------------
    form_link:(event) =>
        # window._link_event = event
        #get label of select
        for_label = event.target.parentElement.attributes.for.value
        #grab selected option if nothing is selected then return false
        selected = $("##{for_label}").val()
        # TODO: more generic! get model name from label and use some
        # mapping to point to right url name! For this applyies only to clients
        if (!!selected)
            destination = "klienci/#{selected}"
        else
            destination = "klienci/dodaj"
        # freeze this model for later use
        # this could be new model or saved one with unsaved changes
        # dont validate it at all !
        @form.commit({skip_validation:true})
        # set obj to be saved
        obj =
            route_params: @route_params
            model: @model.clone()
            destination: destination

        localStorage.setObject('_unsaved', obj)
        Chaplin.utils.redirectTo {url: destination}


    form_help:(event) =>
        @publishEvent 'tell_user' , event.target.text

    refresh_form: =>
        Chaplin.utils.redirectTo {url: "/#{@model.module_name[1]}"}

    delete_action: =>
        @publishEvent('log:info', 'delete  caught')
        @model.destroy
            success: (event) =>
                mediator.collections[@model.module_name[3]].remove(@model)
                @publishEvent 'tell_user', 'Rekord został usunięty'
                @return_path()
            error:(model, response, options) =>
                if response.responseJSON?
                    Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                else
                    Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'

    save_action: (url) =>
        # override this if custom stuff happens
        @publishEvent('log:info', 'save_action  caught')
        # save form
        errors = @form.commit({validate:true})
        if _.isUndefined(errors)
            @model.save({},{
                success:(event) =>
                    if mediator.collections[@model.module_name[3]]?
                        # add it to collection so we don't need to use server ...
                        mediator.collections[@model.module_name[3]].add(@model)
                    @publishEvent 'tell_user', "Rekord #{@model.get_url()} zapisany"
                    @return_path()
                error:(model, response, options) =>
                    if response.responseJSON?
                        Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                    else
                        Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'
            })
        else
            @publishEvent 'tell_user', "Błąd w formularzu! Pola #{@get_errors(errors)} należy wypełnić."

    return_path: =>
        # for new object we need the ?query=....
        if @route_params[1]['previous']['query']
            Chaplin.utils.redirectTo
                url: "#{@route_params[1]['previous']['path']}?#{@route_params[1]['previous']['query']}"
        # for saved objects we need the {id: 123} params
        else
            Chaplin.utils.redirectTo(
                @route_params[1]['previous']['name'],
                @route_params[1]['previous']['params']
            )

    back_action: (event) =>
        @publishEvent('log:info', 'back_action  caught')
        @return_path()

    get_form: =>
        @publishEvent('log:info',"form name: #{@form_name}")
        @form = new Backbone.Form
            model:  @model
            template: _.template(@model.get_form())
            #templateData:{ }

        # --- debug
        window._form = @form if mediator.online is false
        @form.render()

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
        @render_tabs()
        #so we only render nav once !
        if @edit_panel_rendered is false
            @render_edit_panel()

    current_tab: =>
        # we want to render autocomplete and maps for specific tab
        @tab_id

    render_tabs: (tab_id='tab_1') =>
        # lets hide / show the tab which is required
        # if we have divs named tab_\d need to create tabs
        @publishEvent('log:warn', "view: edit-view render tabs() #{tab_id}")
        if @$el.find('div[id^=tab_]').length
            @publishEvent('log:debug', 'view: found tabs')
            #hide all tabs
            @$el.find('div[id^=tab_]').css('display', 'none')
            # unhide the one we need
            @$el.find("##{tab_id}").css('display', 'inline')
        # the secound tab with resouces doesn't refreshes itself propely
        @$el.find('[data-role="listview"]').listview().listview('refresh')


    init_autocomplete: =>
        @publishEvent('log:info', "init_autocomplete on #{@tab_id}")
        # if you find #autocomlete in currently rendered tab then add Omap to it
        if @$el.find("##{@tab_id}").find('#autocomplete').exists() is true
            @map = new Omap model:@model, div: @tab_id

    change_tab: (e)=>
        @publishEvent('log:info', "change tab #{e.target.dataset.id}")
        @tab_id = "tab_#{e.target.dataset.id}"
        @render_tabs(@tab_id)
        @init_autocomplete()
        @publishEvent('edit-view:tab_changed', "#{@tab_id}")

    render_edit_panel: =>
        @publishEvent('log:debug', "render edit_panel")
        # NOTE: at the time of writing edit_panel_template is not required as we only using one template
        @subview "edit_panel", new EditPanelView panel_type: @edit_panel_template
        @subview("edit_panel").render()
        @publishEvent('jqm_refersh:render')
        #so we only render nav once !
        @edit_panel_rendered = true

    subscript: =>
        # append subscript to html markup
        # IN order to set it up
        # 1. change yaml to include .subscript class
        # 2. add dict subscript to @model with right value
        # this wraps the field and appends needed classes
        all_divs = @$el.find('.subscript')
        for div in all_divs
            input = $(div).find('input')
            $(input).attr('data-wrapper-class', 'controlgroup-textinput ui-btn')
            $(input).wrap('<div data-role="controlgroup" data-type="horizontal"></div>')

            name = $(input).attr('name')
            if @model.sufix?[name]?
                $(input).after("<button>#{@model.sufix[name]}</button>")
            if @model.prefix?[name]?
                $(input).before("<button>#{@model.prefix[name]}</button>")


    attach: =>
        super
        @publishEvent('log:info', 'view: edit-view afterRender()')
        @publishEvent 'disable_buttons', @model.can_edit(@model.get_edit_type()) ? false , @model.get_edit_type(), @delete_only
        #we don't want to be able to delete models which are not saved ever !
        if @model.isNew()
            $("#delete-button").addClass('ui-state-disabled')
        #move listing inints into listing view
        if not @form_name.match('rent|sell')
            @subscript()
            # init resources when they are needed
            if _.isObject(@model.schema.resources)
                @publishEvent('log:info', 'view: attach initate uploader , sortable, events ')
                @init_events()
                @init_uploader()
                @init_sortable()
        @init_autocomplete()
        @publishEvent 'jqm_refersh:render'



        # _remove_resources:(listEditor, itemEditor, extra) =>

        #     # fineuploader doesn't support deleting files later then directly after upload
        #     # so need to do this by hand
        #     self = @
        #     url = "http://localhost:8080/v1/pliki/#{itemEditor.value.uuid}"
        #     $.ajax(
        #         url: url
        #         beforeSend: (xhr) ->
        #             xhr.setRequestHeader('X-Auth-Token' , mediator.gen_token(url))
        #         type: "DELETE"
        #         success: (data, textStatus, jqXHR ) =>
        #             #lets delete this item from editor
        #             # console.log('success', data, textStatus, jqXHR)
        #             items = self.form.fields.resources.getValue()
        #             new_items = []
        #             # console.log('all itmes:', items, '  removing ' , itemEditor.value.uuid)
        #             for i in items
        #                 if i.uuid is itemEditor.value.uuid
        #                     self.form.fields.resources.editor.removeItem(i, items.indexOf(i))
        #                     # console.log('removed:', i, items.indexOf(i))
        #         error: (jqXHR, textStatus, errorThrown ) ->
        #             self.publishEvent("tell_user", jqXHR.responseJSON.title or errorThrown)
        #         #contentType: "application/json"
        #         # dataType: "json"
        #         # data: {"file": itemEditor.value.uuid}
        #     )
