View = require 'views/edit-view'
mediator = require 'mediator'
module.exports = class ImportView extends View
    initialize: (options) =>
        super
        # @upload_multiple = false
        # send url data from controler
        @delegate 'change', "#export_select", @set_export

    attach: =>
        super
        @publishEvent('log:info', 'view: import afterRender()')
        # so list items (resources) can be refreshed on time
        # _.delay(@refresh_resource,10)


