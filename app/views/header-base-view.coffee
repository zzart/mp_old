#template = require 'views/templates/header_base'
View = require 'views/navigation-base-view'
#View = require 'views/base/view'
mediator = require 'mediator'

module.exports = class HeaderBase extends View

    initialize: ->
        super
        @delegate 'click', '#info-btn', @info_screen
        @delegate 'click', '#viewed-btn', @viewed_screen

    info_screen: ->
        str = ""
        for i in _.last(mediator.info, 10)
            str = "#{str}<li>#{i}</li>"
        val = "<h5>Info</h5><ul>#{str}</ul>"
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
        val = "<h5>Ostatio oglądane</h5><br /> <ul data-role='listview' >#{str}</ul>"
        $('#viewed').html(val)
        $ul = $("#viewed")
        try
            $ul.enhanceWithin()
        catch error
            @publishEvent("log:warn", error)
        $('#viewed').popup('open',{ positionTo: "#viewed-btn", transition:"fade" })

