View = require 'views/base/view'
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
        @filter = @params.filter
        @collection_hard = @params.collection
        @collection = _.clone(@params.collection)
        @listing_type = @params.listing_type ? false
        @controller = @params.controller
        if _.isNull(localStorage.getObject(@controller))
            localStorage.setObject(@controller, {})
        # console.log(@collection)
        @template = require "views/templates/#{@params.template}"
        @delegate 'change', '#select-action', @select_action
        @delegate 'change', '#all', @select_all_action
        @delegate 'click',  '#refresh', @refresh_action
        #@delegate 'click',  ".ui-table-columntoggle-btn", @column_action
        @delegate 'change', '#select-filter', @filter_action
        @delegate 'change', '#flip-checkbox', @filter_action
        #@delegate 'tablecreate' , @table_create

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


    select_all_action: =>
        selected = $('#list-table>thead input:checkbox ').prop('checked')
        $('#list-table>tbody input:checkbox ').prop('checked', selected).checkboxradio("refresh")

    select_action: (event) =>
        #get all selected offers
        selected = $('#list-table>tbody input:checked ')
        console.log(selected)
        self = @
        clean_after_action = (selected) =>
            #Once action is done clear the selection
            $('#list-table>tbody input:checkbox ').prop('checked', false).checkboxradio("refresh")
            $("#select-action :selected").removeAttr('selected')
            selected = null
            return
        @publishEvent('log:info', "performing action #{event.target.value} for offers #{selected}")
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
                    #clean only after the CLICK event
                    clean_after_action(selected)
        else
            @publishEvent 'tell_user', 'Musisz zaznaczyć przynajmniej jeden element ;)'
            clean_after_action(selected)

    filter_action: (event) =>
        # needs data-filter attribute on select emelemt
        # we can apply one or more filters
        @publishEvent('log:debug', event.target.value)
        @filter = event.target.dataset.filter
        if _.isEmpty(event.target.value)
            # reset filter object
            obj = localStorage.getObject(@controller)
            obj[@filter] = ''
            localStorage.setObject(@controller, obj)
        else
            obj = localStorage.getObject(@controller)
            obj[@filter] = parseInt(event.target.value)
            localStorage.setObject(@controller, obj)
        @filter_apply()

    filter_apply: =>
        @publishEvent('log:debug', 'filter apply')
        obj = localStorage.getObject(@controller)

        #TODO: doesn't work for multiple filter objects
        if obj[@filter] isnt false
            console.log(obj)
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


    attach: =>
        super
        @publishEvent('log:info', 'view: list-view afterRender()')
        #initialize sorting tables  http://tablesorter.com/docs/
        #można sortować wielokolumnowo przytrzymując shift ;)
        if @collection.length > 1
            $("#list-table").tablesorter({sortList:[[4,0]], headers:{0:{'sorter':false}, 1:{'sorter':false}}})
        @publishEvent 'jqm_refersh:render'
        @publishEvent 'table_refresh'







