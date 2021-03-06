#View = require 'views/base/view'
CollectionView = require 'views/base/collection-view'
mediator = require 'mediator'
module.exports = class ListView extends CollectionView
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
        @template = require "views/templates/#{@params.template}"
        @delegate 'change', '#select-action', @select_action
        @delegate 'change', '#all', @select_all_action
        @delegate 'click',  '#refresh', @refresh_action
        @delegate 'change', "[data-query]", @query_action
        @delegate 'change', "#view-menu [data-filter]", @filter_action
        #@delegate 'click',  ".ui-table-columntoggle-btn", @column_action
        #@delegate 'tablecreate' , @table_create
        @delegate 'click',  "[href='#list-table-popup']", @open_column_popup
        @publishEvent('log:debug', @params)
        #init_events: =>
        #    @delegate 'click',  ".ui-table-columntoggle-btn", @column_action
        #    @delegate 'click',  "[href='#list-table-popup']", @column_action

        #column_action: (event) =>
        #    console.log('click')
        #    event.preventDefault()
        #    $("#list-table-popup").popup('open')
        #table_create: (event) =>
        #    @publishEvent 'table_refresh'
        window.collection = @collection_hard

    open_column_popup:(event) =>
        @publishEvent("log:debug", "coumn toggle popup")
        event.preventDefault()
        $('#list-table-popup').popup('open')

    query_action: (event) =>
        @publishEvent("log:debug", "query_action called")

    select_all_action: =>
        selected = $('#list-table>thead input:checkbox ').prop('checked')
        $('#list-table>tbody input:checkbox ').prop('checked', selected).checkboxradio("refresh")

    select_action: (event) =>
        #get all selected offers
        selected = $('#list-table>tbody input:checked ')
        # console.log(selected)
        self = @
        clean_after_action = (selected) =>
            #Once action is done clear the selection
            $('#list-table>tbody input:checkbox ').prop('checked', false).checkboxradio("refresh")
            $("#select-action :selected").removeAttr('selected')
            selected = null
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
                                Chaplin.EventBroker.publishEvent('log:debug', "Element usunięty id#{model.get('id')}")
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
                    #clean only after the CLICK event
                    clean_after_action(selected)
        else
            @publishEvent 'tell_user', 'Musisz zaznaczyć przynajmniej jeden element ;)'
            clean_after_action(selected)

    filter_action: (event) =>
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        #console.log('klik', event.which, event.type, event)
        # always start with fresh collection
        @collection = _.clone(@collection_hard)
        # needs data-filter attribute on select emelemt
        # we can apply one or more filters
        key = event.target.dataset.filter
        id = event.target.id
        @undelegate 'change', "##{id}", @filter_action
        #for booleans
        if event.target.type == 'checkbox'
            @publishEvent("log:debug", event.target.type )
            value = event.target.checked
        else if event.target.type == 'select-one'
            @publishEvent("log:debug", event.target.type )
            value = parseInt(event.target.value)
        else
            value = event.target.value

        if _.isNaN(value)
            @filter = _.omit(@filter, key)
            @publishEvent("log:debug", "omiting #{key}" )
            # console.log(@filter)
        else
            @filter[key] = value

        @publishEvent('log:debug', key)
        @publishEvent('log:debug', value)

        # console.log(@filter)
        if _.isEmpty(@filter)
            #@render()
            return
        else
            list_of_models = @collection_hard.where(@filter)
            @collection.reset(list_of_models)
            #$("input[type='radio'] ##{id}" ).prop( "checked", value ).checkboxradio( "refresh" )
            #$("input[type='checkbox'] ##{id}" ).prop( "checked", value ).checkboxradio( "refresh" )
            #@render()


    filter_apply: =>

        @publishEvent('log:debug', 'filter apply')
        #TODO: doesn't work for multiple filter objects
        if obj[@filter] isnt false
            # console.log(obj)
            @publishEvent('log:debug', 'filter apply')
            list_of_models = @collection_hard.where(obj)
            @collection.reset(list_of_models)
        else
            @publishEvent('log:debug', 'filter reset')
            @collection = _.clone(@collection_hard)
        @render()


    refresh_action: (event) =>
        event.preventDefault()
        @publishEvent('log:debug', 'refresh')
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

    selects_refresh: =>
        if @collection.query
            for k,v of @collection.query
                $("[data-query=\'#{k}\']").val(v)
                $("[data-query=\'#{k}\']").selectmenu('refresh')

    getTemplateData: =>
        collection: @collection.toJSON()
        listing_type: @listing_type
        agents: localStorage.getObjectNames('agents')
        clients: localStorage.getObjectNames('clients')
        branches: localStorage.getObject('branches')

    render: =>
        super
        #remove any previously created table column toggle popups ( important for new rendering )
        $("#list-table-popup").remove()
        $("#list-table-popup-popup").remove()

    attach: =>
        super
        @publishEvent('log:debug', 'view: list-view afterRender()')
        #initialize sorting tables  http://tablesorter.com/docs/
        #można sortować wielokolumnowo przytrzymując shift ;)
        if @collection.length > 1
            $("#list-table").tablesorter({sortList:[[4,0]], headers:{0:{'sorter':false}, 1:{'sorter':false}}})
        @publishEvent 'jqm_refersh:render'
        @publishEvent 'table_refresh'
        @selects_refresh()







