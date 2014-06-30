template = require 'views/templates/viewed'
View = require 'views/base/view'

module.exports = class ViewedView extends View
    template: template
    containerMethod : 'html'
    id: 'viewed'
    attributes: { 'data-role':'popup','data-theme':'b', 'data-position-to':'window', 'data-arrow':'true'}
    className:'ui-content'

    attach: =>
        super
        @publishEvent('log:debug', 'ViewedView:attach()')

