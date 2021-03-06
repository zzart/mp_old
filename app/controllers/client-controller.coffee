Controller = require 'controllers/auth-controller'
ListView = require 'views/client-list-view'
ClientView = require 'views/client-view'
Collection = require 'models/client-collection'
Model = require 'models/client-model'
mediator = require 'mediator'

module.exports = class ClientListController extends Controller
    list:(params, route, options) ->
        @publishEvent('log:debug', 'in client list controller')
        route_params = [params, route, options]
        mediator.collections.clients = new Collection
        # console.log(mediator.collections.clients)
        mediator.last_query = _.clone(options.query)
        mediator.collections.clients.query_add(options.query)
        mediator.collections.clients.fetch
        #data: params
            data: mediator.collections.clients.query
            beforeSend: =>
                @publishEvent 'loading_start'
                @publishEvent 'tell_user', 'Ładuje listę klientów ...'
            success: =>
                @publishEvent('log:debug', "data with #{params} fetched ok" )
                @publishEvent 'loading_stop'
                @view = new ListView {
                    collection:mediator.collections.clients
                    template:'client_list_view'
                    region:'content'
                    route_params: route_params
                }
            error: =>
                @publishEvent 'loading_stop'
                @publishEvent 'server_error'

    add:(params, route, options) ->
        @publishEvent('log:debug', 'in clientadd controller')
        route_params = [params, route, options]
        mediator.models.client = new Model
        @model = mediator.models.client
        @view = new ClientView {
            model:@model
            region:'content'
            route_params: route_params
        }

    show:(params, route, options) ->
        @publishEvent('log:debug', 'in client show controller')
        route_params = [params, route, options]

        if _.isObject(mediator.collections.clients?.get(params.id))
            @model = mediator.collections.clients.get(params.id)
            @publishEvent 'tell_viewed', @model.get_url()
            @view = new ClientView {
                model:@model
                region:'content'
                route_params: route_params
            }
        else
            mediator.models.client = new Model
            @model = mediator.models.client
            @model.set('id', params.id)
            @model.fetch
                success: =>
                    @publishEvent('log:debug', "data with #{params} fetched ok" )
                    @publishEvent 'loading_stop'
                    @publishEvent 'tell_viewed', @model.get_url()
                    @view = new ClientView {
                        model:@model
                        region:'content'
                        route_params: route_params
                    }

    dispose: ->
        # NOTE: controler by default calls this method and erases ALL attributes, binds and other stuff (even inside mediator object)
        # we need model.attributes to persist accross all controllers for quick access !
        # so before we get rid of everything let's deepCopy this obj
        @publishEvent('log:debug', 'dispose method called client controller --------')
        try
            # if comming from home we won't have a collection ....
            deepCopy = mediator.collections.clients.clone()
        catch e
            @publishEvent('log:warning', "dispose caught error #{e}" )
            # better to set it undefined so when we checking _.isObject etc. it's cleaner to resolve
            deepCopy = undefined
        super
        mediator.collections.clients = deepCopy

