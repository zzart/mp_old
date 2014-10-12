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
            @template = require "views/templates/#{@params.template}_mobile"
        else
            @template = require "views/templates/#{@params.template}"

        # NOTE: this catches clicks from navigation subview!
        @subscribeEvent('navigation:refresh', @refresh_action)
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
        selected = $('#list-table>tbody input:checked')
        for i in selected
            if $(i).attr('id') isnt 'all'
                @selected_items.push($(i).attr('id'))
        @selected_items = _.uniq(@selected_items)
        @publishEvent("log:debug", "select_items array #{@selected_items}")


    select_single: (e)=>
        if e.target.tagName is 'IMG'
            e.preventDefault()
            @publishEvent("log:debug", "IMG click ! ")
            id = parseInt(e.currentTarget.dataset.id)
            if _.contains(@selected_items, id)
                #get its index
                index = @selected_items.indexOf(id)
                #remove it from array (index , number of items after)
                @selected_items.splice(index, 1)
                $(e.target).replaceWith(@selected_items_pictures[id])
                @publishEvent("log:debug", "REmoved from selected_items list: #{@selected_items}")
                #TODO: change image to something else
            else
                i = new Image()
                i.src = 'data:image/png;base64,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'

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
        else
            @publishEvent 'tell_user', 'Nic nie znaleźiono!<br />Aby dodać pierwszy element naciśnij  <a class="ui-btn ui-shadow ui-corner-all ui-icon-edit ui-btn-icon-notext ui-btn-inline">Dodaj</a>'
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
                console.log('1-------- zmien_agenta')
                $("#agent-choose li").unbind().click ->
                    console.log('2-------- zmien_agenta')
                    $('#popgeneric').popup('close')
                    # inside click f() we can reference attributes of element
                    # on which click was established
                    # so @value is list item 'value' attribute
                    console.log('3-------- zmien_agenta')
                    console.log(self.selected_items)
                    for id in self.selected_items
                        console.log('4--------- zmien_agenta')
                        # TODO: this might take a while so we could do progress bar of some sorts....
                        console.log(@value, id)
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
