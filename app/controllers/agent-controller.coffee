Controller = require 'controllers/auth-controller'
ListView = require   'views/agent-list-view'
AddView = require    'views/agent-add-view'
EditView = require   'views/agent-edit-view'
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
        @publishEvent('log:info', 'in agentadd controller')
        mediator.models.agent = new Model
        schema = mediator.models.user.get('schemas').agent
        mediator.models.agent.schema = schema
        @view = new AddView {params, region:'content'}

    show:(params, route, options) ->
        @publishEvent('log:info', 'in agent show controller')
        @redirectTo {'/agenci'} unless _.isObject(mediator.collections.agents.get(params.id))
        @view = new EditView {params, region:'content'}

