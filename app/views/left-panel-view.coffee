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
        @delegate 'click', '.link_disabled', @paid_only
        @delegate 'click', 'a', @close_panel

        #panel_self_close: =>
        #    @publishEvent('log:debug', 'panel self close')
        #    $('#left-panel').panel('close')


    close_panel: =>
        @$el.panel('close')

    paid_only: ->
        val = "<h3>Przepraszamy</h3><p>Funkcjonalność dostępna tylko na <b>płatnych</b> kontach</p>"
        @publishEvent('tell_user', val)


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
