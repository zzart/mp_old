View = require 'views/base/view'
mediator = require 'mediator'
module.exports = class View extends View
    autoRender: true
    containerMethod : 'html'
    container : '#right-panel'
    initialize: (options) =>
        @template = options.template
        @listing_type = options.listing_type

        # NOTE: this just mearly registers clicks on panel els and publishes info to be caught by list-view.coffee
        @delegate 'change', '#select-action', @select_action
        @delegate 'click',  '#refresh', @refresh_action
        @delegate 'change', "[data-query]", @query_action
        @delegate 'change', "[data-filter]", @filter_action

    query_action: (event) =>
        event.preventDefault()
        @publishEvent("navigation:query_action", event)

    filter_action: (event) =>
        event.preventDefault()
        @publishEvent("navigation:filter_action", event)

    refresh_action: (event) =>
        event.preventDefault()
        @publishEvent('navigation:refresh', event)

    select_action: (event) =>
        event.preventDefault()
        @publishEvent('navigation:select_action', event)

    render: =>
        super
        @publishEvent('log:debug', 'NavigationView: nav-view render()')

    getTemplateData: =>
        listing_type: @listing_type
        agents: localStorage.getObject('agents')
        clients: localStorage.getObject('clients')
        branches: localStorage.getObject('branches')

    attach: =>
        super
        # panel content needs manuall refresh
        @$el.enhanceWithin()
        @publishEvent('log:debug', 'NavigationView: afterAttach()')

