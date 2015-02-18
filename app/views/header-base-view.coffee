#template = require 'views/templates/header_base'
# View = require 'views/header-action-view'
View = require 'views/base/view'
mediator = require 'mediator'

module.exports = class HeaderBase extends View

    initialize: (options) ->
        super
        @delegate 'click', '#info-btn', @info_screen
        @delegate 'click', '#viewed-btn', @viewed_screen


    info_screen: ->
        # account
        as = localStorage.getObject('account')
        account = "Liczba ofert: <b>#{as.total_listings}</b><br />Przestrzeń dysku: <b>#{as.disk_usage}</b><br />Status konta: <b>#{as.status}</b><br />Pakiet: <b>#{as.price_plan}</b>"
        # info -------
        val = """
            <h3>#{mediator.models.user.get('first_name')} #{mediator.models.user.get('surname')}</h3>
            <p>#{mediator.models.user.get('email')}</p>
            <p>#{account}</p>
            <p><a href="/login" id='logoff' data-role="button" data-theme="a">Wyloguj</a></p>"""
        $('#info').html(val)
        $ul = $("#info")
        try
            $ul.enhanceWithin()
        catch error
            @publishEvent("log:warn", error)
        $('#info').popup('open',{ positionTo: "#info-btn", transition:"fade" })

    viewed_screen: ->
        last = ""
        for i in _.last(mediator.info, 10)
            last = "#{last}<li>#{i}</li>"
        str = ""
        for i in _.last(_.uniq(mediator.viewed), 20)
            str = "#{str}<li>#{i}</li>"
        val = """<h5>Ostatio oglądane</h5>
            <ul data-role='listview' >#{str}</ul>
            <br />
            <h5>Ostatnie komunikaty</h5>
            <p><ul style="padding-left:10px; list-style:none">#{last}</ul></p>"""
        $('#viewed').html(val)
        $ul = $("#viewed")
        try
            $ul.enhanceWithin()
        catch error
            @publishEvent("log:warn", error)
        $('#viewed').popup('open',{ positionTo: "#viewed-btn", transition:"fade" })

