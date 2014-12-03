View = require 'views/base/view'
#SubView = require 'views/list-items-view'
NavigationView = require 'views/navigation-view'
mediator = require 'mediator'

module.exports = class ListView extends View
    autoRender: true
    containerMethod: "html"
    #attributes: { 'data-role':'content' }
    id: 'content'
    className: 'ui-content'
    initialize: (params) ->
        super
        # send url data from controler
        @params = params
        @filter = {}
        @selected_items = []
        @selected_items_pictures = {} # to keep icons of selected items
        @collection_hard = @params.collection
        # @collection = @params.collection
        @collection = _.clone(@params.collection)
        @listing_type = @params.listing_type ? false
        @navigation = require "views/templates/#{@params.template}_navigation"
        # when we on mobile we want lists and not tables
        if bowser.mobile is true
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
        window.col_hard = @collection_hard if mediator.online is false
        window.col = @collection if mediator.online is false

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
                i.src = "data:image/png;base64,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"

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
                    self.clean_after_action()

            if event.target.value == 'wygeneruj_ids'
                @model = @collection.models[0]
                for id in self.selected_items
                    url = "#{@model.urlRoot}/odswiez_ids/#{id}"
                    @mp_request(@model, url, 'GET', 'Wszystkie ID dla tego oddzaiłu zostały ponownie wygenerowane')
                $(@).off('click')
                self.render()
                self.clean_after_action()

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
                    # inside click f() we can reference attributes of element
                    # on which click was established
                    # so @value is list item 'value' attribute
                    for id in self.selected_items
                        # TODO: this might take a while so we could do progress bar of some sorts....
                        #console.log(@value, id)
                        model = self.collection_hard.get(id)
                        # set (change:agent) will trigger sync on model
                        model.set('agent', @value)
                    # Remove click event !!!!!!!!!!!!!!!!!
                    $(@).off('click')
                    self.render()
                    self.clean_after_action()

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
                    for id in self.selected_items
                        # console.log(@value, i.id)
                        model = self.collection_hard.get(id)
                        url = "#{model.urlRoot}/#{id}/email/#{@value}?private=false"
                        self.mp_request(model, url, 'GET', 'Email wysłany', 'Email nie został wysłany')
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
                    # inside click f() we can reference attributes of element on which click was established
                    # so @value is list item 'value' attribute
                    for id in self.selected_items
                        model = self.collection_hard.get(id)
                        url = "#{model.urlRoot}/#{id}/email/#{$("#email_send").val()}?private=false"
                        self.mp_request(model, url, 'GET', 'Email wysłany', 'Email nie został wysłany')
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
