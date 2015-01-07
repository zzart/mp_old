View = require 'views/base/view'
template = require 'views/templates/left-panel'
mediator = require 'mediator'

module.exports = class LeftPanelView extends View
    attributes: {
        'data-role':'panel'
        'data-position':'left'
        #'data-position-fixed':'true'
        #'data-dismissible':'false'
        #'data-display':'push'
        'data-theme':'b'
    }
    id: 'left-panel'
    containerMethod : 'append'
    container : 'body'
    template: template

    initialize: ->
        super
        #need to wrap and unwrap div regions - required markap for panel
        @delegate 'panelbeforeopen', @panel_beforeopen
        @delegate 'panelbeforeclose', @panel_beforeclose
        @delegate 'panelopen', @panel_open
        @delegate 'panelclose', @panel_close
        #@delegate 'click', '#left-panel', @panel_self_close
        #@delegate 'click', @panel_self_close
        @delegate 'click', '#account-status-btn', @account_status
        @delegate 'click', '.link_disabled', @paid_only
        @delegate 'click', 'a', @close_panel
        @delegate 'click', '#logoff', @logoff

        #panel_self_close: =>
        #    @publishEvent('log:debug', 'panel self close')
        #    $('#left-panel').panel('close')


    logoff: (e) =>
        e.preventDefault()
        @publishEvent('log:info', 'login off')
        mediator.models.user = null
        Chaplin.utils.redirectTo {url: 'login'}
        @publishEvent 'tell_user', "Pomyślnie wylogowany"

    close_panel: =>
        @$el.panel('close')

    paid_only: ->
        val = "<h3>Przepraszamy</h3><p>Funkcjonalność dostępna tylko na <b>płatnych</b> kontach</p>"
        @publishEvent('tell_user', val)

    account_status: ->
        as = localStorage.getObject('account')
        val = "<p>Liczba ofert: <b>#{as.total_listings}</b><br />Przestrzeń dysku: <b>#{as.disk_usage}</b><br />Status konta: <b>#{as.status}</b><br />Pakiet: <b>#{as.price_plan}</b></p>"
        @publishEvent('tell_user', val)
        #$('#info').html(val)
        #$('#info').popup('open',{ positionTo: "#account-status-btn", transition:"fade" })

    getTemplateData: =>
        disk_usage: localStorage.getItem('disk_usage')

    panel_beforeopen: =>
        @publishEvent('log:debug', 'before panel open')
        #$("#header").unwrap()
        #$("#content").unwrap()
        #$("#footer").unwrap()

    panel_open: =>
        @publishEvent('log:debug', 'panel open')
        #$(".ui-panel-page-container-b").css('background-color','#F9F9F9')
        #$("#header").wrap("<div id='header-region'></div>")
        #$("#content").wrap("<div id='content-region'></div>")
        #$("#footer").wrap("<div id='footer-region'></div>")
        #@publishEvent 'jqm_refresh:render'

    panel_beforeclose: =>
        @publishEvent('log:debug', 'panel before close')

    panel_close: =>
        @publishEvent('log:debug', 'panel close')
        #@publishEvent 'jqm_refresh:render'

    attach: =>
        super
        @publishEvent('log:debug', 'LeftPanelView: attach()')
