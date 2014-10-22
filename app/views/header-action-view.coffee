View = require 'views/base/view'
mediator = require 'mediator'

# BASE CLASS for contextual menu and horizontal filters in list view
module.exports = class HeaderActionView extends View
    initialize: (options) ->
        super
        @publishEvent('log:debug', "HeaderActionView options: #{JSON.stringify(options)}" )
        @delegate 'change', '#select-action', @select_action
        @delegate 'click',  '#refresh', @refresh_action
        @delegate 'change', "[data-query]", @query_action
        @delegate 'change', "[data-filter]", @filter_action
        try
            @ltype = options.options.query.category
        catch e
            @ltype = undefined
            @publishEvent("log:warn", "Params are not defined: #{JSON.stringify(options)}" )
        @publishEvent("log:debug", "----------------------------------HeaderActionView end")

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
        agents: localStorage.getObject('agents')
        clients: localStorage.getObject('clients')
        branches: localStorage.getObject('branches')
        listing_type: @ltype

