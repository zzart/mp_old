template = require 'views/templates/header_base'
View = require 'views/base/view'
mediator = require 'mediator'

module.exports = class HeaderView extends View
    template: template
    containerMethod : 'html'
    id: 'header'
    attributes: { 'data-role':'header', 'data-theme':'b' }
    initialize: ->
        super
        @delegate 'click', '#first-name-placeholder', @login_screen
        @delegate 'click', '#info-btn', @info_screen
        @delegate 'click', '#viewed-btn', @viewed_screen

    login_screen: ->
        mediator.user = {}
        mediator.controllers = {}
        mediator.models = {}
        Chaplin.utils.redirectTo {url: '/login'}

    info_screen: ->
        str = ""
        for i in _.last(mediator.info, 10)
            str = "#{str}<li>#{i}</li>"
        val = "<h4>Info</h4><ul>#{str}</ul>"
        $('#info').html(val)
        $ul = $("#info")
        try
            $ul.enhanceWithin()
        catch error
            @publishEvent("log:warn", error)
        $('#info').popup('open',{ positionTo: "#info-btn", transition:"fade" })

    viewed_screen: ->
        str = ""
        for i in _.last(_.uniq(mediator.viewed), 20)
            str = "#{str}<li>#{i}</li>"
        val = "<h4>Ostatio oglądane</h4><br /> <ul data-role='listview'  >#{str}</ul>"
        $('#viewed').html(val)
        $ul = $("#viewed")
        try
            $ul.enhanceWithin()
        catch error
            @publishEvent("log:warn", error)
        $('#viewed').popup('open',{ positionTo: "#viewed-btn", transition:"fade" })

    attach: =>
        super
        @publishEvent('log:info', 'HeaderView:attach()')

