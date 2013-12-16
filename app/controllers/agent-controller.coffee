Controller = require 'controllers/auth-controller'
ListView = require   'views/agent-list-view'
EditView = require    'views/agent-view'
Collection = require 'models/agent-collection'
Model = require 'models/agent-model'
mediator = require 'mediator'

module.exports = class AgentController extends Controller
    list:(params, route, options) ->
        @publishEvent('log:info', 'in agent list controller')
        # check if collection is already fetched from server
        if _.isObject(mediator.collections.agents)
            @view = new ListView {params , region:'content'}
        else
            mediator.collections.agents = new Collection
            console.log(mediator.collections.agents)
            mediator.collections.agents.fetch
                data: params
                beforeSend: =>
                    @publishEvent 'loading_start'
                    @publishEvent 'tell_user', 'Ładuje listę agentów ...'
                success: =>
                    @publishEvent('log:info', "data with #{params} fetched ok" )
                    @publishEvent 'loading_stop'
                    @view = new ListView {params , region:'content'}
                error: =>
                    @publishEvent 'loading_stop'
                    @publishEvent 'server_error'

    add:(params, route, options) ->
        #in case someone added branch or user we need updated schema from server!
        @publishEvent('log:info', 'in agentadd controller')
        mediator.models.user = new Model
        @model = mediator.models.user
        @model.fetch
            beforeSend: =>
                @publishEvent 'loading_start'
                @publishEvent 'tell_user', 'Odświeżam formularz ...'
            success: =>
                @publishEvent('log:info', "data with #{params} fetched ok" )
                @publishEvent 'loading_stop'
                @can_edit = mediator.can_edit(mediator.models.user.get('is_admin'),1,0)
                @schema =localStorage.getObject('schemas').agent
                @model.schema = _.clone(@schema)
                @view = new EditView {form_name:'agent_form', model:@model, can_edit:@can_edit, edit_type:'add', region:'content'}
            error: =>
                @publishEvent 'loading_stop'
                @publishEvent 'server_error'


    show:(params, route, options) ->
        @publishEvent('log:info', 'in agent show controller')
        if not _.isObject(mediator.collections.agents?.get?(params.id))
            mediator.collections.agents = new Collection
            mediator.collections.agents.fetch
                data: params
                beforeSend: =>
                    @publishEvent 'loading_start'
                success: =>
                    @publishEvent('log:info', "data with #{params} fetched ok" )
                    @publishEvent 'loading_stop'
                    if not _.isObject(mediator.collections.agents.get(params.id))
                        @publishEvent 'tell_user', 'Agent nie został znaleziony'
                        Chaplin.utils.redirectTo {url: '/agenci'}
                error: =>
                    @publishEvent 'loading_stop'
                    @publishEvent 'server_error'
        #in case someone added branch or user we need updated schema from server!
        @model = mediator.models.user
        @model.fetch
            beforeSend: =>
                @publishEvent 'loading_start'
                @publishEvent 'tell_user', 'Odświeżam formularz ...'
            success: =>
                @publishEvent('log:info', "data with #{params} fetched ok" )
                @publishEvent 'loading_stop'
                @can_edit = mediator.can_edit(mediator.models.user.get('is_admin'),1,0)
                @schema =localStorage.getObject('schemas').agent
                @model.schema = _.clone(@schema)
                @view = new EditView {form_name:'agent_form', model:@model, can_edit:@can_edit, edit_type:'add', region:'content'}
            error: =>
                @publishEvent 'loading_stop'
                @publishEvent 'server_error'

