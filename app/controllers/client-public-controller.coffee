Controller = require 'controllers/auth-controller'
ClientListView = require 'views/client-public-list-view'
Collection = require 'models/client-public-collection'
ClientEditView = require 'views/client-public-edit-view'
Model = require 'models/client-model'
mediator = require 'mediator'

module.exports = class ClientPublicController extends Controller
    list:(params, route, options) ->
        # we need to refresh this list everytime as things might have changed
        mediator.collections.clients_public = new Collection
        mediator.collections.clients_public.fetch
            beforeSend: =>
                @publishEvent 'loading_start'
                @publishEvent 'tell_user', 'Ładuje listę klientów ...'
            success: =>
                @publishEvent('log:info', "data with #{params} fetched ok" )
                @publishEvent 'loading_stop'
                @view = new ClientListView {params , region:'content'}
            error: =>
                @publishEvent 'loading_stop'
                @publishEvent 'server_error'

    show:(params, route, options) ->
        @publishEvent('log:info', 'in client show controller')
        @redirectTo {'/klienci-wspolni'} unless _.isObject(mediator.collections.clients_public.get(params.id))
        @view = new ClientEditView {params, region:'content'}