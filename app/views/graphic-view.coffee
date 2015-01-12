View = require 'views/edit-view'
mediator = require 'mediator'
module.exports = class GraphicView extends View
    initialize: (options) =>
        super
        @upload_multiple = false
        # send url data from controler

    attach: =>
        super
        @publishEvent('log:info', 'view: graphic afterRender()')
        # so list items (resources) can be refreshed on time
        _.delay(@refresh_resource,10)


