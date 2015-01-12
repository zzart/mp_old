View = require 'views/edit-view'
mediator = require 'mediator'
module.exports = class BonEditView extends View
    initialize: (options) =>
        super

    attach: =>
        super
        @publishEvent('log:info', 'view: bon-view afterRender()')
        # remove back_button
        # disable_button fires twice but what do i care ;)
        @publishEvent 'disable_buttons', @can_edit ? false , @edit_type, false, true
