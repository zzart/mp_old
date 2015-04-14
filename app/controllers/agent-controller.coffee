Controller = require 'controllers/auth-controller'
ListView = require   'views/agent-list-view'
EditView = require    'views/agent-view'
Collection = require 'models/agent-collection'
Model = require 'models/agent-model'
mediator = require 'mediator'

module.exports = class AgentController extends Controller

    list:(params, route, options) ->
        @publishEvent('log:debug', 'in agent list controller')
        route_params = [params, route, options]
        # check if collection is already fetched from server
        #if _.isObject(mediator.collections.agents)
        #    @view = new ListView {params , region:'content'}
        #else
        mediator.collections.agents = new Collection
        mediator.collections.agents.fetch
            data: params
            beforeSend: =>
                @publishEvent 'loading_start'
                @publishEvent 'tell_user', 'Ładuje listę agentów ...'
            success: =>
                @publishEvent('log:debug', "data with #{params} fetched ok" )
                @publishEvent 'loading_stop'
                @view = new ListView {
                    collection:mediator.collections.agents
                    template:'agent_list_view'
                    filter:'agent_type'
                    region:'content'
                    controller: 'agent_controller'
                    route_params: route_params
                }
            error: =>
                @publishEvent 'loading_stop'
                @publishEvent 'server_error'

    add:(params, route, options) ->
        #in case someone added branch or user we need updated schema from server!
        route_params = [params, route, options]
        mediator.models.user.fetch
            success: =>
                @publishEvent('log:debug', 'in agentadd controller')
                mediator.models.agent = new Model
                @model = mediator.models.agent
                @model.fetch
                    beforeSend: =>
                        @publishEvent 'loading_start'
                        @publishEvent 'tell_user', 'Odświeżam formularz ...'
                    success: =>
                        @publishEvent('log:debug', "data with #{params} fetched ok" )
                        @publishEvent 'loading_stop'
                        mediator.models.user.update_db()
                        @view = new EditView {
                            model:@model
                            region:'content'
                            route_params: route_params
                        }
                    error: =>
                        @publishEvent 'loading_stop'
                        @publishEvent 'server_error'


    show:(params, route, options) ->
        route_params = [params, route, options]
        @publishEvent('log:debug', 'in agent show controller')
        #in case someone added branch or user we need updated schema from server!
        mediator.models.user.fetch
            success: =>
                mediator.models.user.update_db()
                if not _.isObject(mediator.collections.agents?.get?(params.id))
                    @publishEvent('log:debug', 'in agent show IF')
                    mediator.collections.agents = new Collection
                    mediator.collections.agents.fetch
                        data: params
                        beforeSend: =>
                            @publishEvent 'loading_start'
                        success: =>
                            @publishEvent('log:debug', "data with #{params} fetched ok" )
                            @publishEvent 'loading_stop'
                            if not _.isObject(mediator.collections.agents.get(params.id))
                                @publishEvent 'tell_user', 'Agent nie został znaleziony'
                                Chaplin.utils.redirectTo {url: '/agenci'}
                            @publishEvent('log:debug', 'in agent show controller fetch')
                            @model = mediator.collections.agents.get(params.id)
                            @publishEvent 'tell_viewed', @model.get_url()
                            @view = new EditView {
                                model:@model
                                region:'content'
                                route_params: route_params
                            }
                        error: =>
                            @publishEvent 'loading_stop'
                            @publishEvent 'server_error'
                else
                    @publishEvent('log:debug', 'in agent show Else')
                    @model = mediator.collections.agents.get(params.id)
                    @publishEvent 'tell_viewed', @model.get_url()
                    @view = new EditView {
                        model:@model
                        region:'content'
                        route_params: route_params
                    }



    dispose: ->
        # NOTE: controler by default calls this method and erases ALL attributes, binds and other stuff (even inside mediator object)
        # we need model.attributes to persist accross all controllers for quick access !
        # so before we get rid of everything let's deepCopy this obj
        @publishEvent('log:debug', 'dispose method called agent controller --------')
        deepCopy = mediator.collections.agents.clone()
        super
        mediator.collections.agents = deepCopy

