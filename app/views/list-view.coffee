View = require 'views/base/view'
#SubView = require 'views/list-items-view'
NavigationView = require 'views/navigation-view'
mediator = require 'mediator'

module.exports = class ListView extends View
    autoRender: true
    containerMethod: "html"
    attributes: { 'data-role':'content' }
    id: 'content'
    className: 'ui-content'
    initialize: (params) ->
        super
        # send url data from controler
        @params = params
        @filter = {}
        @collection_hard = @params.collection
        # @collection = @params.collection
        @collection = _.clone(@params.collection)
        @listing_type = @params.listing_type ? false
        @navigation = require "views/templates/#{@params.template}_navigation"
        @template = require "views/templates/#{@params.template}"

        # NOTE: this catches clicks from navigation subview!
        @subscribeEvent('navigation:refresh', @refresh_action)
        @subscribeEvent('navigation:filter_action', @filter_action)
        @subscribeEvent('navigation:query_action', @query_action)
        @subscribeEvent('navigation:select_action', @select_action)

        @delegate 'change', '#all', @select_all_action
        #@delegate 'click',  ".ui-table-columntoggle-btn", @column_action
        #@delegate 'tablecreate' , @table_create

        #for column toggle
        #@delegate 'click',  "[href='#list-table-popup']", @open_column_popup
        @publishEvent('log:debug', @params)
        @navigation_rendered = false
        #init_events: =>
        #    @delegate 'click',  ".ui-table-columntoggle-btn", @column_action
        #    @delegate 'click',  "[href='#list-table-popup']", @column_action


    filter_action: (event) =>
        @publishEvent("log:debug", "filter_action_called")
        # event.stopPropagation()
        # event.stopImmediatePropagation()
        # always start with fresh collection
        @collection = _.clone(@collection_hard)
        # needs data-filter attribute on select emelemt
        # we can apply one or more filters
        key = event.target.dataset.filter
        id = event.target.id
        @undelegate 'change', "##{id}", @filter_action
        #@unsubscribeEvent('navigation:filter_action', @)
        #for booleans
        if event.target.type == 'checkbox'
            @publishEvent("log:info", event.target.type )
            value = event.target.checked
        else if event.target.type == 'select-one'
            @publishEvent("log:info", event.target.type )
            value = parseInt(event.target.value)
        else
            value = event.target.value

        if _.isNaN(value)
            @filter = _.omit(@filter, key)
            @publishEvent("log:info", "omiting #{key}" )
            @publishEvent("log:info", @filter)
        else
            @filter[key] = value

        @publishEvent('log:debug', key)
        @publishEvent('log:debug', value)

        # console.log(@filter)
        if _.isEmpty(@filter)
            #TODO: test this
            @render()
        else
            list_of_models = @collection_hard.where(@filter)
            @collection.reset(list_of_models)
            #$("input[type='radio'] ##{id}" ).prop( "checked", value ).checkboxradio( "refresh" )
            #$("input[type='checkbox'] ##{id}" ).prop( "checked", value ).checkboxradio( "refresh" )
            @render()

    query_action: (event) =>
        @publishEvent("log:debug", "query_action called")
        #reset filter
        @filter= {}
        # NOTE: to be inherited from list views

    selects_refresh: =>
        if @collection.query
            for k,v of @collection.query
                $("[data-query=\'#{k}\']").val(v)
                $("[data-query=\'#{k}\']").selectmenu('refresh')

    select_all_action: =>
        @publishEvent("log:debug", "select all action")
        selected = $('#list-table>thead input:checkbox').prop('checked')
        $('#list-table>tbody input:checkbox').prop('checked', selected).checkboxradio("refresh")

    filter_apply: =>
        @publishEvent('log:debug', 'filter apply')
        #TODO: doesn't work for multiple filter objects
        if obj[@filter] isnt false
            @publishEvent("log:info", obj)
            @publishEvent('log:debug', 'filter apply')
            list_of_models = @collection_hard.where(obj)
            @collection.reset(list_of_models)
        else
            @publishEvent('log:debug', 'filter reset')
            @collection = _.clone(@collection_hard)
        @render()

    refresh_action: (event) =>
        event.preventDefault()
        @publishEvent('log:debug', 'refresh_action cougth')
        @collection_hard.fetch
            data: @collection_hard.query or {}
            success: =>
                @publishEvent 'tell_user', 'Odświeżam listę elementów'
                @collection = _.clone(@collection_hard)
                @render()
            error:(model, response, options) =>
                if response.responseJSON?
                    Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                else
                    Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'

    getTemplateData: =>
        collection: @collection.toJSON()
        listing_type: @listing_type
        agents: localStorage.getObject('agents')
        clients: localStorage.getObject('clients')
        branches: localStorage.getObject('branches')

    render: =>
        super
        #remove any previously created table column toggle popups ( important for new rendering )
        #$("#list-table-popup").remove()
        #$("#list-table-popup-popup").remove()
        if @navigation_rendered is false
            @render_subview()


    render_subview: =>
        @publishEvent('log:debug', "render sub_view")
        @subview "navigation", new NavigationView template: @navigation, listing_type: @listing_type
        @subview("navigation").render()
        @publishEvent('jqm_refersh:render')
        #so we only render nav once !
        @navigation_rendered = true

    attach: =>
        super
        @publishEvent('log:debug', 'view: list-view afterRender()')
        #initialize sorting tables  http://tablesorter.com/docs/
        #można sortować wielokolumnowo przytrzymując shift ;)
        if @collection.length > 1
            $("#list-table").tablesorter({sortList:[[4,0]], headers:{0:{'sorter':false}, 1:{'sorter':false}}})
        @publishEvent('jqm_refersh:render')
        @selects_refresh()
        @publishEvent 'table_refresh'

    select_action: (event) =>
        @publishEvent("log:debug", "select action")
        #get all selected offers
        selected = $('#list-table>tbody input:checked')
        # console.log(selected)
        self = @
        clean_after_action = (selected) =>
            #Once action is done clear selected items checkboxes
            $('#list-table>tbody input:checkbox').prop('checked', false).checkboxradio("refresh")
            # Clear dropdown menu
            $("#select-action :selected").removeAttr('selected')
            # this should work but it doesn't
            $("#select-action option:first").attr('selected', 'selected')
            # refresh dropdown
            $("#select-action").selectmenu('refresh')
            selected = null
            # for table THEAD
            @publishEvent 'jqm_refersh:render'
            return

        @publishEvent('log:debug', "performing action #{event.target.value} for offers #{selected}")
        if selected.length > 0
            if event.target.value == 'usun'
                $("#confirm").popup('open')
                # unbind is for stopping it firing multiple times
                $("#confirmed").unbind().click ->
                    for i in selected
                        model = self.collection_hard.get($(i).attr('id'))
                        #model = mediator.collections.branches.get($(i).attr('id'))
                        # TODO: przepisać oferty tego brancha do innego ?
                        model.destroy
                            wait: true # we would like confirmation from server before removing it from the collection
                            success: (event) =>
                                Chaplin.EventBroker.publishEvent('log:info', "Element usunięty id#{model.get('id')}")
                                self.collection_hard.remove(model)
                                self.render()
                                Chaplin.EventBroker.publishEvent 'tell_user', 'Element został usunięty'
                            error:(model, response, options) =>
                                if response.responseJSON?
                                    Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                                else
                                    Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'
                    # Remove click event !!!!!!!!!!!!!!!!!
                    $(@).off('click')
                    self.render()
                    #clean only after the CLICK event
                    clean_after_action(selected)

            if event.target.value == 'zmien_agenta'
                str = ""
                for k,v of localStorage.getObject('agents')
                    str = "#{str}<li value='#{k}'><a id='#{k}'>#{v}</a></li>"
                val = "<h4>Wybierz Agenta</h4><br /><ul data-role='listview' id='agent-choose'>#{str}</ul>"
                $('#popgeneric').html(val)
                $ul = $("#popgeneric")
                try
                    $ul.enhanceWithin()
                catch error
                    @publishEvent("log:warn", error)
                $('#popgeneric').popup('open',{ transition:"fade" })
                # unbind is for stopping it firing multiple times
                $("#agent-choose li").unbind().click ->
                    $('#popgeneric').popup('close')
                    # inside click f() we can reference attributes of element on which click was established
                    # so @value is list item 'value' attribute
                    for i in selected
                        # TODO: this might take a while so we could do progress bar of some sorts....
                        # console.log(@value, i.id)
                        model = self.collection_hard.get(i.id)
                        # set (change:agent) will trigger sync on model
                        model.set('agent', @value)
                    # Remove click event !!!!!!!!!!!!!!!!!
                    $(@).off('click')
                    self.render()
                clean_after_action(selected)

            # send email to client
            if event.target.value == 'send-listing-client'
                str = ""
                for k,v of localStorage.getObject('clients')
                    str = "#{str}<li value='#{k}'><a id='#{k}'>#{v}</a></li>"
                val = "<h4>Wybierz Klienta</h4><br /><ul data-role='listview' id='client-choose'>#{str}</ul>"
                try
                    $('#popgeneric').html(val).enhanceWithin()
                catch error
                    @publishEvent("log:warn", error)
                $('#popgeneric').popup('open',{ transition:"fade" })
                # unbind is for stopping it firing multiple times
                $("#client-choose li").unbind().click ->
                    $('#popgeneric').popup('close')
                    # inside click f() we can reference attributes of element on which click was established
                    # so @value is list item 'value' attribute
                    for item in selected
                        # console.log(@value, i.id)
                        model = self.collection_hard.get(item.id)
                        url = "#{model.urlRoot}/#{item.id}/email/#{@value}?private=false"
                        self.mp_request(model, url, 'GET', 'Email wysłany', 'Email nie został wysłany')
                    # Remove click event !!!!!!!!!!!!!!!!!
                    $(@).off('click')
                    self.render()
                clean_after_action(selected)

            if event.target.value == 'send-listing-address'
                console.log(1)
                form = '''
                    <form>
                    <label for="email_send" class="ui-hidden-accessible">Email:</label>
                    <input name="email_send" id="email_send" placeholder="Wprowadź email" value="" type="text" />
                    <button data-icon="mail" id="address_submit">Wyślij</button>
                    </form>
                '''
                try
                    $('#popgeneric').html(form).enhanceWithin()
                catch error
                    @publishEvent("log:warn", error)
                $('#popgeneric').popup('open',{ transition:"fade" })
                # # unbind is for stopping it firing multiple times
                $("#address_submit").unbind().click (e)->
                    e.preventDefault()
                    $('#popgeneric').popup('close')
                    # inside click f() we can reference attributes of element on which click was established
                    # so @value is list item 'value' attribute
                    for item in selected
                        model = self.collection_hard.get(item.id)
                        url = "#{model.urlRoot}/#{item.id}/email/#{$("#email_send").val()}?private=false"
                        self.mp_request(model, url, 'GET', 'Email wysłany', 'Email nie został wysłany')
                    # Remove click event !!!!!!!!!!!!!!!!!
                    $(@).off('click')
                    self.render()
                clean_after_action(selected)

            if event.target.value == 'wydruk-wewnetrzny' or  event.target.value == 'wydruk-klienta'
                # get model
                for item in selected
                    model = @collection_hard.get(item.id)
                    if event.target.value == 'wydruk-wewnetrzny'
                        url = "#{model.urlRoot}/#{item.id}/#{mediator.models.user.get('company_name')}?private=true"
                    if event.target.value == 'wydruk-klienta'
                        url = "#{model.urlRoot}/#{item.id}/#{mediator.models.user.get('company_name')}?private=false"
                        # NOTE: instead of doing ajax request we need to do window.location
                        # and set the right db
                        # Ajax would just swallow the response from serwer .....
                    window.location = url
                    # Remove click event !!!!!!!!!!!!!!!!!
                    $(@).off('click')
                    self.render()
                clean_after_action(selected)
        else
            @publishEvent 'tell_user', 'Musisz zaznaczyć przynajmniej jeden element!'
            clean_after_action(selected)
        #column_action: (event) =>
        #    console.log('click')
        #    event.preventDefault()
        #    $("#list-table-popup").popup('open')
        #table_create: (event) =>
        #    @publishEvent 'table_refresh'
        # window.collection = @collection_hard

        #open_column_popup:(event) =>
        #    @publishEvent("log:debug", "coumn toggle popup")
        #    event.preventDefault()
        #    $('#list-table-popup').popup('open')
