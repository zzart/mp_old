template = require 'views/templates/confirm'
View = require 'views/base/view'

module.exports = class ConfirmView extends View
    template: template
    containerMethod : 'html'
    id: 'confirm'
    attributes: { 'data-role':'popup','data-dismissible':'false','data-theme':'b'}

    attach: =>
        super
        @publishEvent('log:confirm', 'HeaderView:attach()')

