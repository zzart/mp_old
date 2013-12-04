View = require 'views/base/view'
list_view = require 'views/templates/client_list_view'
mediator = require 'mediator'

module.exports = class ClientListView extends View
    autoRender: true
    containerMethod: "html"
    attributes: { 'data-role':'content' }
    id: 'content'
    className: 'ui-content'
    initialize: (options) ->
        super
        # send url data from controler
        @collection = mediator.collections.clients
        @params = options.params
        @template = list_view
        @last_check_view = 'list_view'
        @last_check_query = 'user'
        @delegate 'change', '#select-action', @action
        @delegate 'change', '#select-filter', @change_query
        @delegate 'change', '#all', @select_all
        @delegate 'click',  '#refresh', @refresh_offers
    select_all: =>
        selected = $('#client-table>thead input:checkbox ').prop('checked')
        $('#client-table>tbody input:checkbox ').prop('checked', selected).checkboxradio("refresh")

    action: (event) =>
        #get all selected offers
        selected = $('#client-table>tbody input:checked ')
        clean_after_action = (selected) =>
            #Once action is done clear the selection
            $('#client-table>tbody input:checkbox ').prop('checked', false).checkboxradio("refresh")
            $("#select-action :selected").removeAttr('selected')
            selected = null
            @render()
            return
        @publishEvent('log:info', "performing action #{event.target.value} for offers #{selected}")
        if selected.length > 0
            if event.target.value == 'usun'
                $("#confirm").popup('open')
                $("#confirmed").click ->
                    for i in selected
                        model = mediator.collections.clients.get($(i).attr('id'))
                        model.destroy
                            success: (event) =>
                                Chaplin.EventBroker.publishEvent('log:info', "klient usunięty id#{model.get('id')}")
                                mediator.collections.clients.remove(model)
                                Chaplin.EventBroker.publishEvent 'tell_user', 'Klient został usunięty'
                            error:(model, response, options) =>
                                Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                    # Remove click event !!!!!!!!!!!!!!!!!
                    $(@).off('click')
                    #clean only after the CLICK event
                    clean_after_action(selected)
        else
            @publishEvent 'tell_user', 'Musisz zaznaczyć przynajmniej jeden element ;)'
            clean_after_action(selected)



    change_query: (event) =>
        @publishEvent('log:debug', event)
        @params['filter'] = event.target.value
        @collection.fetch
            data: @params
            success: =>
                @publishEvent('log:debug', @params)
                @publishEvent 'loading_stop'
                @render()
                @last_check_query = event.target.id
                @refresh_radios()
            beforeSend: =>
                @publishEvent 'loading_start'

    refresh_offers: (event) =>
        event.preventDefault()
        @publishEvent('log:debug', @params)
        @collection.fetch
            data: @params
            success: =>
                @publishEvent 'loading_stop'
                @render()
                @last_check_query = event.target.id
            beforeSend: =>
                @publishEvent 'loading_start'

    getTemplateData: =>
        client: @collection.toJSON()

    render: =>
        super

    attach: =>
        super
        @publishEvent('log:info', 'view: offerlist afterRender()')
        #@initEvents()
        #initialize sorting tables  http://tablesorter.com/docs/
        #można sortować wielokolumnowo przytrzymując shift ;)
        if @collection.length > 1
            $("#client-table").tablesorter({sortList:[[4,0]], headers:{0:{'sorter':false}, 1:{'sorter':false}}})
        @publishEvent 'clientlistview:render'








# -------------------------------------------------------------------------------------------
# @$el.find("[name='radio-choice1']").removeAttr('checked')
# #@$el.find('#'+ @template_name).attr('checked','True')
# @$el.find("[name='radio-choice1']").checkboxradio('refresh')
# @$el.find("[name='radio-choice2']").removeAttr('checked')
# #@$el.find('#'+ @params['qtype']).attr('checked','True')
# @$el.find("[name='radio-choice2']").checkboxradio('refresh')
#attributes: {
#  'data-role':'panel'
#  'data-position':'left'
#  'data-position-fixed':'true'
#  'data-dismissible':'false'
#  'data-display':'reveal'
#  'data-theme':'a'
#}
#container: "[data-role='page']"
#id: 'main-menu'
#template: template
#afterRender: =>
#  super
#  @publishEvent 'menu:render'
#  #console.log(@el.childNodes)
#  #@$el.trigger('pagecreate')
#  #@$el.find('#main-menu').panel('open')






#console.log(@$el)
#console.log(@$("[data-role='page']"))
#@$el.find("[data-role='page']").trigger('pagecreate')
#@$("[data-role='page']").trigger('pagecreate')
#_.defer => @$("[data-role='page']").trigger('pagecreate')
