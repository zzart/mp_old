View = require 'views/edit-view'
mediator = require 'mediator'
module.exports = class ClientAddView extends View
    initialize: (options) =>
        super
        # send url data from controler

        #save_and_add_action: =>
        #savesuper
        #save@save_action('/klienci/dodaj')


    attach: =>
        super
        @publishEvent('log:info', 'view: clientadd afterRender()')

