View = require 'views/base/view'
mediator = require 'mediator'

# BASE CLASS for contextual menu and horizontal filters in list view
module.exports = class BaseView extends View
    initialize: (options) =>
        super
        @publishEvent('log:debug', "Base view options: #{JSON.stringify(options)}" )
        @delegate 'change', '#select-action', @select_action
        @delegate 'click',  '#refresh', @refresh_action
        @delegate 'change', "[data-query]", @query_action
        @delegate 'change', "[data-filter]", @filter_action
        @listing_type = options.options?.query?.category

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


    getTemplateData: =>
        super
        listing_type: @listing_type
        agents: localStorage.getObject('agents')
        clients: localStorage.getObject('clients')
        branches: localStorage.getObject('branches')

