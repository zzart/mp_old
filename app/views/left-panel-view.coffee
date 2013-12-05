View = require 'views/base/view'
template = require 'views/templates/left-panel'
mediator = require 'mediator'

module.exports = class LeftPanelView extends View
    attributes: {
        'data-role':'panel'
        'data-position':'left'
        #'data-position-fixed':'true'
        #'data-dismissible':'false'
        'data-display':'push'
        'data-theme':'a'
    }
    id: 'left-panel'
    containerMethod : 'append'
    container : 'body'
    template: template

    attach: =>
        super
        @publishEvent('log:info', 'LeftPanelView: attach()')
