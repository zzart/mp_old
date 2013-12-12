template = require 'views/templates/info'
View = require 'views/base/view'

module.exports = class InfoView extends View
    template: template
    containerMethod : 'html'
    id: 'info'
    attributes: { 'data-role':'popup','data-theme':'b', 'data-position-to':'window', 'data-arrow':'true'}
    className:'ui-content'

    attach: =>
        super
        @publishEvent('log:info', 'HeaderView:attach()')

