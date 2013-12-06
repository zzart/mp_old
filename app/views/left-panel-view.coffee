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
        #need to wrap and unwrap div regions - required markap for panel
        @delegate 'panelbeforeopen', @panel_beforeopen
        @delegate 'panelbeforeclose', @panel_beforeclose
        @delegate 'panelopen', @panel_open
        @delegate 'panelclose', @panel_close

    panel_beforeopen:=>
        @publishEvent('log:info', 'before panel open')
        $("#header").unwrap()
        $("#content").unwrap()
        $("#footer").unwrap()
    panel_open:=>
        @publishEvent('log:info', 'panel open')
        $("#header").wrap("<div id='header-region'></div>")
        $("#content").wrap("<div id='content-region'></div>")
        $("#footer").wrap("<div id='footer-region'></div>")
        @publishEvent 'jqm_refresh:render'
    panel_beforeclose:=>
        @publishEvent('log:info', 'panel before close')
    panel_close:=>
        @publishEvent('log:info', 'panel close')
        @publishEvent 'jqm_refresh:render'

    attach: =>
        super
        @publishEvent('log:info', 'LeftPanelView: attach()')
