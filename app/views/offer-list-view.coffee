View = require 'views/base/view'
list_view = require 'views/templates/list_view'

module.exports = class OfferListView extends View
    autoRender: true
    container: "[data-role='content']"
    containerMethod: 'html'
    #attributes: { 'class':'ui-page' }
    initialize: (options) ->
        super
        # send url data from controler
        @params = options.params
        @template = list_view
        @last_check_view = 'list_view'
        @last_check_query = 'user'
        @delegate 'change', '#select-action', @action
        @delegate 'change', '#select-filter', @change_query
        @delegate 'change', '#all', @select_all
        @delegate 'click',  '#refresh', @refresh_offers
    select_all: =>
        selected = $('#table-list>thead input:checkbox ').prop('checked')
        $('#table-list>tbody input:checkbox ').prop('checked', selected).checkboxradio("refresh")

    action: (event) =>
        #get all selected offers
        selected = $('#table-list>tbody input:checked ')
        #TODO: for each action publishEvent
        @publishEvent('log:info', "performing action #{event.target.value} for offers #{selected}")
        #Once action is done clear the selection
        $('#table-list>tbody input:checkbox ').prop('checked', false).checkboxradio("refresh")

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
        oferta: @collection.toJSON()

    attach: =>
        super
        @publishEvent('log:info', 'view: offerlist afterRender()')
        #@initEvents()
        #initialize sorting tables  http://tablesorter.com/docs/
        #można sortować wielokolumnowo przytrzymując shift ;)
        $("#table-list").tablesorter({sortList:[[11,0]], headers:{0:{'sorter':false}, 1:{'sorter':false}}})
        @publishEvent 'offerlistview:render'








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
