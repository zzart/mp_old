View = require 'views/base/view'
list_view = require 'views/templates/agent_list_view'
mediator = require 'mediator'

module.exports = class ListView extends View
    autoRender: true
    containerMethod: "html"
    attributes: { 'data-role':'content' }
    id: 'content'
    className: 'ui-content'
    initialize: (options) ->
        super
        # send url data from controler
        @collection = _.clone(mediator.collections.agents)
        @params = options.params
        @template = list_view
        @delegate 'change', '#select-action', @action
        @delegate 'change', '#select-filter', @change_query
        @delegate 'change', '#all', @select_all
        @delegate 'click',  '#refresh', @refresh_offers

    select_all: =>
        selected = $('#agent-table>thead input:checkbox ').prop('checked')
        $('#agent-table>tbody input:checkbox ').prop('checked', selected).checkboxradio("refresh")

    action: (event) =>
        #get all selected offers
        selected = $('#agent-table>tbody input:checked ')
        self = @
        clean_after_action = (selected) =>
            #Once action is done clear the selection
            $('#agent-table>tbody input:checkbox ').prop('checked', false).checkboxradio("refresh")
            $("#select-action :selected").removeAttr('selected')
            selected = null
            @render()
            return
        @publishEvent('log:info', "performing action #{event.target.value} for items #{selected}")
        if selected.length > 0
            if event.target.value == 'usun'
                $("#confirm").popup('open')
                $("#confirmed").click ->
                    for i in selected
                        model = mediator.collections.agents.get($(i).attr('id'))
                        model.destroy
                            wait: true # we would like confirmation from server before removing it from the collection
                            success: (event) =>
                                Chaplin.EventBroker.publishEvent('log:info', "Agent usunięty id#{model.get('id')}")
                                mediator.collections.agents.remove(model)
                                self.render()
                                Chaplin.EventBroker.publishEvent 'tell_user', 'Agent został usunięty'
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



    change_query: (event) =>
        @publishEvent('log:debug', event.target.value)
        if _.isEmpty(event.target.value)
            @collection = _.clone(mediator.collections.agents)
        else
            list_of_models = mediator.collections.agents.where({'agent_type': parseInt(event.target.value)})
            @collection.reset(list_of_models)
        @render()


    refresh_offers: (event) =>
        event.preventDefault()
        @publishEvent('log:debug', 'refresh')
        mediator.collections.agents.fetch
            success: =>
                @publishEvent 'tell_user', 'Odświeżam listę agentów'
                @collection = _.clone(mediator.collections.agents)
                @render()
            error:(model, response, options) =>
                if response.responseJSON?
                    Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                else
                    Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'

    getTemplateData: =>
        window.col = @collection
        agent: @collection.toJSON()

    render: =>
        super

    attach: =>
        super
        @publishEvent('log:info', 'view: offerlist afterRender()')
        #@initEvents()
        #initialize sorting tables  http://tablesorter.com/docs/
        #można sortować wielokolumnowo przytrzymując shift ;)
        if @collection.length > 1
            $("#agent-table").tablesorter({sortList:[[4,0]], headers:{0:{'sorter':false}, 1:{'sorter':false}}})
        @publishEvent 'jqm_refersh:render'








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
