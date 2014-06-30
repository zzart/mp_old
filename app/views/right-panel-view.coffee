View = require 'views/base/view'
template = require 'views/templates/right-panel'
mediator = require 'mediator'

module.exports = class RightPanelView extends View
    attributes: {
        'data-role':'panel'
        'data-position':'left'
        #'data-position-fixed':'true'
        #'data-dismissible':'false'
        'data-display':'push'
        'data-theme':'b'
    }
    id: 'right-panel'
    containerMethod : 'append'
    container : 'body'
    template: template

    initialize: ->
        super
        @delegate 'click', 'a', @close_panel
        @delegate 'click', '#first-name-placeholder', @login_screen
        #need to wrap and unwrap div regions - required markap for panel
        @delegate 'panelbeforeopen', @panel_beforeopen
        #@delegate 'panelbeforeclose', @panel_beforeclose
        @delegate 'panelopen', @panel_open
        @delegate 'panelclose', @panel_close
        #@delegate 'click', '#left-panel', @panel_self_close
        #@delegate 'click', @panel_self_close

    login_screen: ->
        mediator.user = {}
        mediator.controllers = {}
        mediator.models = {}
        Chaplin.utils.redirectTo {url: '/login'}

    close_panel: =>
        @$el.panel('close')

    panel_beforeopen: =>
        @publishEvent('log:debug', 'before panel open')
        $("#header").unwrap()
        $("#content").unwrap()
        $("#footer").unwrap()

    panel_open: =>
        @publishEvent('log:debug', 'panel open')
        $(".ui-panel-page-container-b").css('background-color','#F9F9F9')
        $("#header").wrap("<div id='header-region'></div>")
        $("#content").wrap("<div id='content-region'></div>")
        $("#footer").wrap("<div id='footer-region'></div>")
        @publishEvent 'jqm_refresh:render'

        #panel_beforeclose: =>
        #    @publishEvent('log:debug', 'panel before close')
        #panel_self_close: =>
        #    @publishEvent('log:debug', 'panel self close')
        #    $('#left-panel').panel('close')


    panel_close: =>
        @publishEvent('log:debug', 'panel close')
        @publishEvent 'jqm_refresh:render'

    attach: =>
        super
        @publishEvent('log:debug', 'RightPanelView: attach()')
