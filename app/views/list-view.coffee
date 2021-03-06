View = require 'views/base/view'
#SubView = require 'views/list-items-view'
NavigationView = require 'views/navigation-view'
mediator = require 'mediator'

module.exports = class ListView extends View
    autoRender: true
    containerMethod: "html"
    #attributes: { 'data-role':'content' }
    initialize: (params) ->
        super
        @params = params
        id: params.id or 'content'  #params.id for subview or content for all rest
        className: "iu-#{params.class}" or 'ui-content'  # the same as above
        @filter = {}
        @selected_items = []
        @mobile = params.mobile or bowser.mobile
        @route_params = @params.route_params ? false
        @selected_items_pictures = {} # to keep icons of selected items
        @collection_hard = @params.collection
        # @collection = @params.collection
        @collection = _.clone(@params.collection)
        @listing_type = @params.listing_type ? false
        @navigation = require "views/templates/#{@params.template}_navigation"
        # when we on mobile we want lists and not tables
        if @mobile
            # look for mobile template and use default if not found
            try
                @template = require "views/templates/#{@params.template}_mobile"
            catch e
                @publishEvent('log:debug', "#{e} template not found. Going with non-mobile template")
                @template = require "views/templates/#{@params.template}"
        else
            @template = require "views/templates/#{@params.template}"

        # NOTE: this catches clicks from navigation subview!
        @subscribeEvent('navigation:refresh', @refresh_action)
        @subscribeEvent('navigation:search_reveal', @search_reveal_action)
        @subscribeEvent('navigation:filter_action', @filter_action)
        @subscribeEvent('navigation:query_action', @query_action)
        @subscribeEvent('navigation:select_action', @select_action)

        @delegate 'change', '#all', @select_all_action
        @delegate 'change', ':checkbox', @select_items
        #@delegate 'change', ':checkbox', @open_right_panel
        @delegate 'click', 'a', @select_single
        #@delegate 'click',  ".ui-table-columntoggle-btn", @column_action
        #@delegate 'tablecreate' , @table_create

        #for column toggle
        #@delegate 'click',  "[href='#list-table-popup']", @open_column_popup
        @publishEvent('log:debug', @params)
        @navigation_rendered = false
        # --- debug
        window._col_hard = @collection_hard if mediator.online is false
        window._col = @collection if mediator.online is false
        window._route_params = @route_params if mediator.online is false

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

    select_items: (e) =>
        # for checkboxes to bring some sanity into the world
        # everytime a checkbox is checked we need to adjust @selected_items array
        @publishEvent("log:debug", "select_items called")
        @selected_items = []
        self = @
        selected = $("#list-table>tbody input:checked")
        for i in selected
            if $(i).attr('id') isnt 'all'
                self.selected_items.push($(i).attr('id'))
        @selected_items = _.uniq(@selected_items)
        @publishEvent("log:debug", "select_items array #{@selected_items}")

    select_single: (e) =>
        if e.target.tagName is 'IMG'
            e.preventDefault()
            @publishEvent("log:debug", "IMG click!")
            id = parseInt(e.currentTarget.dataset.id)
            if _.contains(@selected_items, id)
                #get its index
                index = @selected_items.indexOf(id)
                #remove it from array (index , number of items after)
                @selected_items.splice(index, 1)
                $(e.target).replaceWith(@selected_items_pictures[id])
                @publishEvent("log:debug", "Removed from selected_items list: #{@selected_items}")
                #TODO: change image to something else
            else
                i = new Image()
                i.src = @get_image()

                #save picture for unchecks
                @selected_items_pictures[id] = $(e.target)
                $(e.target).replaceWith(i)
                @selected_items.push(id)
                @publishEvent("log:debug", "moved to selected_items list: #{@selected_items}")

        @publishEvent("log:debug", "replaced #{@selected_items}")
        @selected_items = _.uniq(@selected_items)
        @publishEvent("log:debug", "with #{@selected_items}")


    select_all_action: =>
        @publishEvent('jqm_refersh:render') # need this - jqm has to annoyingly initalize checkboxes
        @publishEvent("log:debug", "select all action")
        selected = $('#list-table>thead input:checkbox').prop('checked')
        $('#list-table>tbody input:checkbox').prop('checked', selected).checkboxradio("refresh")

    open_right_panel: (event) =>
        # NOT USED !!!!
        #@publishEvent("log:debug", "open_right_panel")
        #if $(event.target).is(':checked')
        #    @publishEvent('rightpanel:open')


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

    refresh_action: (e) =>
        e.preventDefault()
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
        @publishEvent('log:debug', "selected_items : #{@selected_items}")

    search_reveal_action: (e) =>
        e.preventDefault()
        @publishEvent('log:debug', 'search_reveal_action cougth')
        #toggle() isn't supported anymore
        $("#search-list").css('display', 'block')

    getTemplateData: =>
        collection: @collection.toJSON()
        listing_type: @listing_type
        agents: localStorage.getObjectNames('agents')
        clients: localStorage.getObjectNames('clients')
        branches: localStorage.getObject('branches')

    render: =>
        super
        #remove any previously created table column toggle popups ( important for new rendering )
        #$("#list-table-popup").remove()
        #$("#list-table-popup-popup").remove()
        if @navigation_rendered is false
            @render_subview()

    render_subview: =>
        @publishEvent('log:debug', "render sub_view with #{@params.template}")
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
        @publishEvent('log:info', "collection has a length of : #{@collection.length}")
        if @collection.length >= 1
            $("#list-table").tablesorter({sortList:[[4,0]], headers:{0:{'sorter':false}, 1:{'sorter':false}}})
        # @publishEvent 'tell_user', 'Nic nie znaleźiono!<br />Aby dodać pierwszy element naciśnij  <a class="ui-btn ui-shadow ui-corner-all ui-icon-edit ui-btn-icon-notext ui-btn-inline">Dodaj</a>'
        @publishEvent('jqm_refersh:render')
        @selects_refresh()
        @publishEvent 'table_refresh'

    clean_after_action:  =>
        @publishEvent("log:debug", "clean_after_action called")
        if bowser.mobile? isnt true
            # for table THEAD
            # @publishEvent('rightpanel:close')
            # for JQM so it doesn't complain
            $('#list-table>tbody').enhanceWithin()
            #Once action is done clear selected items checkboxes
            $('#list-table>tbody input:checkbox').prop('checked', false).checkboxradio("refresh")
            # Clear dropdown menu
            $("#select-action :selected").removeAttr('selected')
        # this should work but it doesn't
        #$("#select-action option:first").attr('selected', 'selected')
        # this seem to work instead
        $("#select-action").val('')
        # refresh dropdown
        $("#select-action").selectmenu('refresh')
        @publishEvent('jqm_refersh:render')
        #restore all icons
        for key, val of @selected_items_pictures
            $("[data-id=#{key}] img").replaceWith(@selected_items_pictures[key])
        #clear data
        @selected_items = []
        @selected_items_pictures = []
        if @collection.length = 0
            $("#list-table").tablesorter()

    select_action: (event) =>
        @publishEvent("log:debug", "select_action with selected_items : #{@selected_items}")
        self = @

        @publishEvent('log:debug', "performing action #{event.target.value} for offers #{self.selected_items}")
        if self.selected_items.length > 0
            if event.target.value == 'usun'
                $("#confirm").popup('open')
                # unbind is for stopping it firing multiple times
                $("#confirmed").unbind().click ->
                    for id in self.selected_items
                        model = self.collection_hard.get(id)
                        #model = mediator.collections.branches.get($(i).attr('id'))
                        # TODO: przepisać oferty tego brancha do innego ?
                        model.destroy
                        # we would like confirmation from server before removing it from the collection
                            wait: true
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
                    self.clean_after_action()

            if event.target.value == 'wygeneruj_ids'
                @model = @collection.models[0]
                for id in self.selected_items
                    url = "#{@model.urlRoot}/odswiez_ids/#{id}"
                    @mp_request(@model, url, 'GET', 'Wszystkie numery ID dla tego oddzaiłu zostaną ponownie wygenerowane a oferty zaznaczone do całościowych eksportów. To może potrwać ok. 2 minuty.')
                $(@).off('click')
                self.render()
                self.clean_after_action()

            if event.target.value == 'zmien_agenta'
                str = ""
                for agent in localStorage.getObject('agents')
                    str = "#{str}<li value='#{agent.id}' data-filtertext='#{agent.first_name} #{agent.surname} #{agent.username} #{agent.email}'><a id='#{agent.id}'>#{agent.first_name} #{agent.surname}</a></li>"
                val = """<h5>Wybierz Agenta</h5>
                <form class='ui-filterable'>
                <input id='agent-choose-input' data-type='search' data-theme='a'></form>
                <ul data-role='listview' id='agent-choose' data-filter='true' data-input='#agent-choose-input' >#{str}</ul>"""
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
                    # inside click f() we can reference attributes of element
                    # on which click was established
                    # so @value is list item 'value' attribute
                    for id in self.selected_items
                        # TODO: this might take a while so we could do progress bar of some sorts....
                        #console.log(@value, id)
                        model = self.collection_hard.get(id)
                        # add query params so that server knows that we INTEND to change owner
                        # set (change:agent) will trigger sync on model
                        model.set('agent', @value)
                    # Remove click event !!!!!!!!!!!!!!!!!
                    $(@).off('click')
                    self.render()
                    self.clean_after_action()

            # show client a listing
            if event.target.value == 'show-listing-client'
                str = ""
                for client in localStorage.getObject('clients')
                    str = "#{str}<li value='#{client.id}' data-filtertext='#{client.first_name} #{client.surname} #{client.email} #{client.notes} #{client.pesel} #{client.phone} #{client.company_name} #{client.requirements}'><a id='#{client.id}'>#{client.first_name} #{client.surname}</a></li>"
                val = """<h5>Wybierz Klienta</h5>
                <form class='ui-filterable'><input id='client-choose-input' data-type='search' data-theme='a'></form>
                <ul data-role='listview' id='client-choose' data-filter='true' data-input='#client-choose-input' >#{str}</ul>"""
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
                    for id in self.selected_items
                        # console.log(@value, i.id)
                        model = self.collection_hard.get(id)
                        url = "#{model.urlRoot}/#{id}/pokaz/#{@value}"
                        self.mp_request(model, url, 'GET', 'Oferta zaznaczona do pokazania')
                    # Remove click event !!!!!!!!!!!!!!!!!
                    $(@).off('click')
                    self.render()
                    self.clean_after_action()

            # send email to client
            if event.target.value == 'send-listing-client'
                str = ""
                for client in localStorage.getObject('clients')
                    str = "#{str}<li value='#{client.id}' data-filtertext='#{client.first_name} #{client.surname} #{client.email} #{client.notes} #{client.pesel} #{client.phone} #{client.company_name} #{client.requirements}'><a id='#{client.id}'>#{client.first_name} #{client.surname}</a></li>"
                val = """<h5>Wybierz Klienta</h5>
                <form class='ui-filterable'><input id='client-choose-input' data-type='search' data-theme='a'></form>
                <ul data-role='listview' id='client-choose' data-filter='true' data-input='#client-choose-input' >#{str}</ul>"""
                try
                    $('#popgeneric').html(val).enhanceWithin()
                catch error
                    @publishEvent("log:warn", error)
                $('#popgeneric').popup('open',{ transition:"fade" })
                # unbind is for stopping it firing multiple times
                $("#client-choose li").unbind().click ->
                    $('#popgeneric').popup('close')
                    self.publishEvent("tell_user", 'Przygotowuje email...')
                    # inside click f() we can reference attributes of element on which click was established
                    # so @value is list item 'value' attribute
                    for id in self.selected_items
                        # console.log(@value, i.id)
                        model = self.collection_hard.get(id)
                        url = "#{model.urlRoot}/#{id}/email/#{@value}?private=false"
                        self.mp_request(model, url, 'GET', 'Email został wysłany')
                    # Remove click event !!!!!!!!!!!!!!!!!
                    $(@).off('click')
                    self.render()
                    self.clean_after_action()

            if event.target.value == 'send-listing-address'
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
                    self.publishEvent("tell_user", 'Przygotowuje email...')
                    # inside click f() we can reference attributes of element on which click was established
                    # so @value is list item 'value' attribute
                    for id in self.selected_items
                        model = self.collection_hard.get(id)
                        url = "#{model.urlRoot}/#{id}/email/#{$("#email_send").val()}?private=false"
                        self.mp_request(model, url, 'GET', 'Email został wysłany')
                    # Remove click event !!!!!!!!!!!!!!!!!
                    $(@).off('click')
                    self.render()
                    self.clean_after_action()

            if event.target.value == 'wydruk-wewnetrzny' or  event.target.value == 'wydruk-klienta'
                # get model
                for id in self.selected_items
                    model = @collection_hard.get(id)
                    if event.target.value == 'wydruk-wewnetrzny'
                        url = "#{model.urlRoot}/#{id}/#{mediator.models.user.get('company_name')}?private=true"
                    if event.target.value == 'wydruk-klienta'
                        url = "#{model.urlRoot}/#{id}/#{mediator.models.user.get('company_name')}?private=false"
                        # NOTE: instead of doing ajax request we need to do window.location
                        # and set the right db
                        # Ajax would just swallow the response from serwer .....
                    window.location = url
                    # Remove click event !!!!!!!!!!!!!!!!!
                    $(@).off('click')
                    self.render()
                self.clean_after_action()
        else
            @publishEvent 'tell_user', 'Musisz zaznaczyć przynajmniej jeden element!'
            self.clean_after_action()
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
