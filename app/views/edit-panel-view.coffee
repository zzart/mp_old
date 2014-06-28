View = require 'views/base/view'
mediator = require 'mediator'
template = require 'views/templates/edit-panel'

module.exports = class View extends View
    autoRender: true
    containerMethod : 'html'
    container : '#right-panel'
    initialize: (options) =>
        @panel_type = options.panel_type
        @template = template
        # @model = options.model
        # NOTE: this just mearly registers clicks on panel els and publishes info to be caught by edit-view.coffee
        @delegate 'click',  '#history', @show_history
        @delegate 'change', "[data-query]", @show_to_client

    show_history: (event) =>
        event.preventDefault()
        @publishEvent("edit_panel:show_history", event)

    show_to_client: (event) =>
        event.preventDefault()
        @publishEvent("edit_panel:show_to_client", event)

    render: =>
        super
        @publishEvent('log:debug', 'EditPanelView: render()')

    getTemplateData: =>
        # model: @model
        clients: localStorage.getObject('clients')

    attach: =>
        super
        # panel content needs manuall refresh
        @$el.enhanceWithin()
        @publishEvent('log:debug', 'EditPanelView: afterAttach()')

