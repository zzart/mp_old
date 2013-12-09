mediator =  require 'mediator'
module.exports = class Layout extends Chaplin.Layout
    initialize: ->
        super
        # TODO: logging decide what to do !
        @log = log4javascript.getDefaultLogger()
        # ajaxAppender = new log4javascript.AjaxAppender('http://localhost:8080/logging')
        # @log.addAppender(ajaxAppender)
        @log.info('layout init')
        jqm = true

        if jqm
            @subscribeEvent('structureController:render', @jqm_init)
            @subscribeEvent('leftpanel:render', @jqm_leftpanel)
            #@subscribeEvent('index:render', @jqm_init)
            #@subscribeEvent('login:render', @jqm_init)
            #@subscribeEvent('addofferview:render', @jqm_refersh)
            @subscribeEvent('schema_change', @schema_change)
            @subscribeEvent('jqm_refersh:render', @jqm_refersh)
            @subscribeEvent('jqm_page_refersh:render', @jqm_page_refersh)
            @subscribeEvent('loading_start', @jqm_loading_start)
            @subscribeEvent('loading_stop', @jqm_loading_stop)
            @subscribeEvent('disable_form', @disable_form)

            @subscribeEvent('server_error', @server_error)
            @subscribeEvent('tell_user', @tell_user)

        @subscribeEvent('log:debug', @log_debug)
        @subscribeEvent('log:info', @log_info)
        @subscribeEvent('log:warn', @log_warn)
        @subscribeEvent('log:error', @log_error)

    jqm_loading_start: =>
        $.mobile.loading('show')
    jqm_loading_stop: =>
        $.mobile.loading('hide')

    schema_change: =>
        #when certain models are added/updated/removed we need to refresh schema
        @log.info('****************refreshing schema')
        mediator.models.user.fetch()

    tell_user: (information) =>
        $('#info').text(information)
        #set display popup with delay
        setTimeout(->
            $('#info').popup('open',{ positionTo: "#info-btn", transition:"fade" })
        , 100)
        setTimeout(->
            $("#info").popup("close")
        , 4000)

    server_error: =>
        @log.debug('server error')
        $('#info').text('Upss, brak kontaktu z serwerem...')
        #set display popup with delay
        setTimeout(->
            $('#info').popup('open',{ positionTo: "#info-btn", transition:"fade" })
        , 100)
        setTimeout(->
            $("#info").popup("close")
        , 3000)

    disable_form:(can_edit) =>
        @log.info('form disable caught')
        if not can_edit
            $("form input:radio").checkboxradio('disable')
            $("form :input").textinput({disabled:true} )
            $("form [data-role='slider']").slider({ disabled: true })
            $("form [data-role='controlgroup'] select").selectmenu( "disable" )

    log_debug:(option) =>
        @log.debug(option)
    log_info:(option) =>
        @log.info(option)
    log_warn:(option) =>
        @log.warn(option)
    log_error:(option) =>
        @log.error(option)

    jqm_init: =>
        #this will initialize page after page is ready
        @log.info('layout: event jqm_init caugth')
        $ ->
            $.mobile.initializePage()
            $.mobile.loading('hide')
            #need to init panel and all its components
            $("#left-panel").panel()
            $( "body > [data-role='panel'] [data-role='listview']" ).listview()
            $("body > [data-role='panel'] [data-role='collapsible']").collapsible()
            #{ history: false } needs to be there since popup will support back button hence change URL which we don't want !!!!
            $("#info").popup({ history: false })
            #@log.info('layout: jqm_init happend')
            #$('#main-container').enhanceWithin()
        #window.location.hash = 'index'
    jqm_leftpanel: =>
        @log.info('layout: event jqm_menurender caugth')
        #$("#left-panel").panel('open')

    jqm_refersh: =>
        #manually doing page refresh straight from DOM
        @log.info('layout: event jqm_refresh caugth')
        $("#content").enhanceWithin()
    jqm_page_refersh: =>
        #manually doing page refresh straight from DOM
        @log.info('layout: event jqm_page_refresh caugth')
        $("#page").enhanceWithin()
    jqm_recreate: =>
        #TODO: we might check in the DOM if this was rendered alreadyand only then do it or not.




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
