View = require 'views/edit-view'
mediator = require 'mediator'

module.exports = class CompanyView extends View
    initialize: (options) =>
        super

    attach: =>
        super
        @publishEvent('log:info', 'view: company-view afterRender()')
        # remove delete button
        $("#delete-button").addClass('ui-state-disabled')
