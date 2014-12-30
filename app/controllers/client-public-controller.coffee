Controller = require 'controllers/auth-controller'
ListView = require 'views/client-public-list-view'
Collection = require 'models/client-public-collection'
ClientView = require 'views/client-public-view'
Model = require 'models/client-model'
mediator = require 'mediator'

module.exports = class ClientPublicController extends Controller

    list:(params, route, options) ->
        @publishEvent('log:info', 'in clientPublic list controller')
        route_params = [params, route, options]
        # we need to refresh this list everytime as things might have changed
        mediator.collections.clients_public = new Collection
        mediator.collections.clients_public.fetch
            beforeSend: =>
                @publishEvent 'loading_start'
                @publishEvent 'tell_user', 'Ładuje listę klientów ...'
            success: =>
                @publishEvent('log:info', "data with #{params} fetched ok" )
                @publishEvent 'loading_stop'
                @view = new ListView {
                    collection:mediator.collections.clients_public
                    template:'client_public_list_view'
                    region:'content'
                    route_params: route_params
                }
            error: =>
                @publishEvent 'loading_stop'
                @publishEvent 'server_error'

    show:(params, route, options) ->
        route_params = [params, route, options]
        @publishEvent('log:info', 'in clientPublic show controller')
        @redirectTo {'/klienci-wspolni'} unless _.isObject(mediator.collections.clients_public.get(params.id))
        @model = mediator.collections.clients_public.get(params.id)
        @schema =localStorage.getObject('client_schema')
        @model.schema = _.clone(@schema)
        @can_edit = mediator.can_edit(mediator.models.user.get('is_admin'),@model.get('agent'), mediator.models.user.get('id'))
        @view = new ClientView {
            form_name:'client_form'
            model:@model
            can_edit:@can_edit
            delete_only:true
            region:'content'
            route_params: route_params
        }


    dispose: ->
        # NOTE: controler by default calls this method and erases ALL attributes, binds and other stuff (even inside mediator object)
        # we need model.attributes to persist accross all controllers for quick access !
        # so before we get rid of everything let's deepCopy this obj
        @publishEvent('log:info', 'dispose method called cliets_public controller --------')
        deepCopy = mediator.collections.clients_public.clone()
        super
        mediator.collections.clients_public = deepCopy

