View = require 'views/base/view'
mediator = require 'mediator'
module.exports = class View extends View
    autoRender: true
    id: 'view-list'
    initialize: (options) =>
        @template = options.template
        @collection = options.collection
    getTemplateData: =>
        collection: @collection.toJSON()
        agents: localStorage.getObject('agents')
        clients: localStorage.getObject('clients')
        branches: localStorage.getObject('branches')
    render: =>
        super
        @publishEvent('log:info', 'subview: sub-view render()')
    attach: =>
        #super
        #NOTE: not calling SUPER here so we can manually append EL to CONTAINER the way we want it
        #and we need it inside the form element
        ## clear any previous lists
        $('#view-list').remove()
        $('#view-menu').after(@$el)
        #initialize sorting tables  http://tablesorter.com/docs/
        #można sortować wielokolumnowo przytrzymując shift ;)
        if @collection.length > 1
            $("#list-table").tablesorter({sortList:[[4,0]], headers:{0:{'sorter':false}, 1:{'sorter':false}}})
        #@publishEvent 'table_refresh'
        @publishEvent('log:info', 'subview afterAttach()')
