template = require 'views/templates/header_edit'
HeaderBase = require 'views/header-base-view'
mediator = require 'mediator'

module.exports = class HeaderEditView extends HeaderBase
    template: template
    containerMethod : 'html'
    id: 'header'

    initialize: (options)->
        super
        @delegate 'click', "#edit_tabs a", @change_tab
        @tabs = options.tabs # dics which will generate appropriate number of tabs

    getTemplateData: =>
        tabs: @tabs

    change_tab: (e) =>
        e.preventDefault()
        @publishEvent('header:change_tab', e)

    attach: =>
        super
        $("#header").enhanceWithin()
        @publishEvent('log:debug', 'HeaderView:attach()')

