mediator =  require 'mediator'
module.exports = class Layout extends Chaplin.Layout
    initialize: ->
        super
        if mediator.online
            @log = console
        else
            @log = console
            #@log = log4javascript.getDefaultLogger()
            #ajaxAppender = new log4javascript.AjaxAppender("#{mediator.server_url}/logging")
            #@log.addAppender(ajaxAppender)
        @log.debug('layout init') if mediator.online is false
        jqm = true

        if jqm
            @subscribeEvent('structureController:render', @jqm_init)
            #@subscribeEvent('leftpanel:render', @jqm_leftpanel)
            #@subscribeEvent('rightpanel:render', @jqm_rightpanel)
            #@subscribeEvent('index:render', @jqm_init)
            #@subscribeEvent('login:render', @jqm_init)
            #@subscribeEvent('addofferview:render', @jqm_refersh)
            @subscribeEvent('schema_change', @schema_change)
            @subscribeEvent('jqm_refersh:render', @jqm_refersh)
            @subscribeEvent('jqm_page_refersh:render', @jqm_page_refersh)
            @subscribeEvent('jqm_footer_refersh:render', @jqm_footer_refersh)
            @subscribeEvent('loading_start', @jqm_loading_start)
            @subscribeEvent('loading_stop', @jqm_loading_stop)
            @subscribeEvent('disable_buttons', @disable_buttons)
            @subscribeEvent('disable_form', @disable_form)
            @subscribeEvent('table_refresh', @jqm_table_refresh)
            @subscribeEvent('remove_unsaved', @remove_unsaved)

            @subscribeEvent('server_error', @server_error)
            @subscribeEvent('tell_user', @tell_user)
            @subscribeEvent('tell_viewed', @tell_viewed)

        @subscribeEvent('log:debug', @log_debug)
        @subscribeEvent('log:info', @log_info)
        @subscribeEvent('log:warn', @log_warn)
        @subscribeEvent('log:error', @log_error)
        @subscribeEvent('log:trace', @log_trace)

    jqm_loading_start: =>
        $.mobile.loading('show')
    jqm_loading_stop: =>
        $.mobile.loading('hide')

    schema_change: =>
        #when certain models are added/updated/removed we need to refresh schema
        @log.debug('****************refreshing schema') if mediator.online is false
        mediator.models.user.fetch()

    tell_viewed: (information) =>
        mediator.viewed.push(information)

    tell_user: (information) =>
        $('#info').html(information)
        mediator.info.push(information)
        #set display popup with delay
        setTimeout(->
            $('#info').popup('open',{ positionTo: "#info-btn", transition:"fade" })
        , 100)
        setTimeout(->
            $("#info").popup("close")
        , 4000)

    remove_unsaved: =>
        localStorage.removeItem('_unsaved')

    server_error: =>
        @log.debug('server error')  if mediator.online is false
        $('#info').text('Upss, brak kontaktu z serwerem...')
        #set display popup with delay
        setTimeout(->
            $('#info').popup('open',{ positionTo: "#info-btn", transition:"fade" })
        , 100)
        setTimeout(->
            $("#info").popup("close")
        , 3000)

    disable_form:(can_edit) =>
        @log.info('form disable caught') if mediator.online is false
        if not can_edit
            $("form input:radio").checkboxradio('disable')
            $("form :input").textinput({disabled:true} )
            $("form [data-role='slider']").slider({ disabled: true })
            $("form [data-role='controlgroup'] select").selectmenu( "disable" )

    disable_buttons:(can_edit, edit_type, delete_only, no_back) =>
        @log.debug("caugth disable_buttons: #{can_edit}, #{edit_type}, #{delete_only}, #{no_back}") if mediator.online is false
        if can_edit is false
            @log.debug('permissions can_edit') if mediator.online is false
            $("#delete-button").addClass('ui-state-disabled')
            $("#save-button").addClass('ui-state-disabled')
            # $("#back-button").attr('disabled', true)
        if edit_type is 'add'
            $("#delete-button").addClass('ui-state-disabled')
        if !!delete_only
            @log.debug('permissions delete_only') if mediator.online is false
            $("#save-button").addClass('ui-state-disabled')
        if !!no_back
            @log.debug('permissions no_back') if mediator.online is false
            $("#back-button").addClass('ui-state-disabled')

    log_debug:(option) =>
        @log.debug(option) if mediator.online is false
    log_info:(option) =>
        @log.info(option)  if mediator.online is false
    log_warn:(option) =>
        @log.warn(option)  if mediator.online is false
    log_error:(option) =>
        @log.error(option) if mediator.online is false
    log_trace:() =>
        @log.trace() if mediator.online is false

    jqm_init: =>
        #this will initialize page after page is ready
        @log.debug('layout: event jqm_init caugth') if mediator.online is false
        $ ->
            $.mobile.initializePage()
            $.mobile.loading('hide')
            #need to init panel and all its components
            $("#left-panel").panel()
            $("#right-panel").panel()
            $("body > [data-role='panel'] [data-role='listview']" ).listview()
            $("body > [data-role='panel'] [data-role='collapsible']").collapsible()
            #{ history: false } needs to be there since popup will support back button hence change URL which we don't want !!!!
            $("#info").popup({ history: false })
            #@log.info('layout: jqm_init happend')
            #$('#main-container').enhanceWithin()
        #window.location.hash = 'index'
    jqm_leftpanel: =>
        @log.debug('layout: event jqm_menurender caugth') if mediator.online is false
        #$("#left-panel").panel('open')

    jqm_refersh: =>
        @log.debug('layout: event jqm_refresh caugth') if mediator.online is false
        #this is callbacks based so i know precisely WHEN jqm finished rendering !!!
        self = @
        f1 = (callback) ->
            callback()
        f2 = (callback) ->
            callback()
        f1(->
            #self.tell_user('Pracuje....')
            $("#content-region").enhanceWithin()
            f2(->
                self.publishEvent('jqm_finished_rendering')
                self.log.debug('jqm_refresh finished') if mediator.online is false
            )
        )
        #$.mobile.loading('hide')
        # $ ->
        #     $("#content-region").enhanceWithin()

    jqm_refersh_alone: =>
        #manually doing page refresh straight from DOM
        f1 = (callback) ->
            callback()
        f2 = (callback) ->
            callback()
        f3 = (callback) ->
            callback()

        self = @
        f1(->
            self.jqm_loading_start()
            self.tell_user('loading')
            console.log(1)
            f2(->
                elf.jqm_refersh()
                console.log(2)
                f3(->
                    self.jqm_loading_stop()
                    console.log(3)
                )
            )
        )

    jqm_page_refersh: =>
        @log.debug('layout: event jqm_page_refresh caugth') if mediator.online is false
        $("#page").enhanceWithin()
        $.mobile.loading('hide')
        #manually doing page refresh straight from DOM
    jqm_footer_refersh: =>
        #manually doing page refresh straight from DOM
        @log.debug('layout: event jqm_footer_refresh caugth') if mediator.online is false
        $("#footer-region").enhanceWithin()
    jqm_recreate: =>
        #TODO: we might check in the DOM if this was rendered alreadyand only then do it or not.

    jqm_table_refresh: =>
        @log.debug('layout: jqm_table_refresh ') if mediator.online is false
        $("#list-table").table("refresh")



        # JqM1.4
        # $(":mobile-pagecontainer").pagecontainer("getActivePage");
        # $(':mobile-pagecontainer').pagecontainer('change', '#index')
        #
            #$("fieldset").controlgroup("refresh")
        #$("[type='radio']").checkboxradio('refresh')
        #$.mobile.loadPage('#content')
        #$("input[type='radio']").checkboxradio()
        #$("input[type='radio']").checkboxradio("refresh")
        #$("[data-role='page']").trigger('pagecreate')
        #$("[data-role='panel']").panel('open')
        #$(".ui-loader").remove()
        #_.defer => @.("[data-role='page']").trigger('pagecreate')
            #$("[data-role='page']").removeClass('ui-page')
            #$("[data-role='page']").addClass('ui-page')
