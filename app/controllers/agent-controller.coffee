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
                @publishEvent('log:info', "data with #{params} fetched ok" )
                @publishEvent 'loading_stop'
                @view = new ListView {
                    collection:mediator.collections.agents
                    template:'agent_list_view'
                    filter:'agent_type'
                    region:'content'
                    controller: 'agent_controller'
                }
            error: =>
                @publishEvent 'loading_stop'
                @publishEvent 'server_error'

    add:(params, route, options) ->
        #in case someone added branch or user we need updated schema from server!
        mediator.models.user.fetch
            success: =>
                @publishEvent('log:info', 'in agentadd controller')
                mediator.models.agent = new Model
                @model = mediator.models.agent
                @model.fetch
                    beforeSend: =>
                        @publishEvent 'loading_start'
                        @publishEvent 'tell_user', 'Odświeżam formularz ...'
                    success: =>
                        @publishEvent('log:info', "data with #{params} fetched ok" )
                        @publishEvent 'loading_stop'
                        @can_edit = mediator.can_edit(mediator.models.user.get('is_admin'),1,0)
                        mediator.models.user.update_db()
                        @schema =localStorage.getObject('agent_schema')
                        @model.schema = _.clone(@schema)
                        @view = new EditView {form_name:'agent_form', model:@model, can_edit:@can_edit, edit_type:'add', region:'content'}
                    error: =>
                        @publishEvent 'loading_stop'
                        @publishEvent 'server_error'


    show:(params, route, options) ->
        @publishEvent('log:info', 'in agent show controller')
        console.log(params, route, options)
        #in case someone added branch or user we need updated schema from server!
        mediator.models.user.fetch
            success: =>
                mediator.models.user.update_db()
                if not _.isObject(mediator.collections.agents?.get?(params.id))
                    @publishEvent('log:info', 'in agent show IF')
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
                            @publishEvent('log:info', 'in agent show controller fetch')
                            @model = mediator.collections.agents.get(params.id)
                            @can_edit = mediator.can_edit(mediator.models.user.get('is_admin'),1,0)
                            @edit_type = ''
                            if mediator.models.user.get('id') is @model.get('id')
                                @edit_type = 'add'
                            @schema =localStorage.getObject('agent_schema')
                            #@model.schema = @schema
                            @model.schema = _.clone(@schema)
                            @view = new EditView {form_name:'agent_form', model:@model, can_edit:@can_edit, edit_type:@edit_type,  region:'content'}
                        error: =>
                            @publishEvent 'loading_stop'
                            @publishEvent 'server_error'
                else
                    @publishEvent('log:info', 'in agent show Else')
                    @model = mediator.collections.agents.get(params.id)
                    # this is so user can't delete themself!!
                    @edit_type = ''
                    if mediator.models.user.get('id') is @model.get('id')
                        @edit_type = 'add'
                    @can_edit = mediator.can_edit(mediator.models.user.get('is_admin'),1,0)
                    @schema =localStorage.getObject('agent_schema')
                    @model.schema = _.clone(@schema)
                    @view = new EditView {form_name:'agent_form', model:@model, can_edit:@can_edit, edit_type:@edit_type,  region:'content'}


