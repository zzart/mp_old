Controller = require 'controllers/auth-controller'
ClientListView = require 'views/client-list-view'
ClientAddView = require 'views/client-add-view'
ClientEditView = require 'views/client-edit-view'
Collection = require 'models/client-collection'
Model = require 'models/client-model'
mediator = require 'mediator'

module.exports = class ClientListController extends Controller
    list:(params, route, options) ->
        @publishEvent('log:info', 'in client list controller')
        mediator.collections.clients = new Collection
        # console.log(mediator.collections.clients)
        mediator.collections.clients.fetch
            data: params
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

    add:(params, route, options) ->
        @publishEvent('log:info', 'in clientadd controller')
        mediator.models.client = new Model
        schema = mediator.models.user.get('schemas').client
        mediator.models.client.schema = schema
        @view = new ClientAddView {params, region:'content'}

    show:(params, route, options) ->
        @publishEvent('log:info', 'in client show controller')
        @redirectTo {'/klienci'} unless _.isObject(mediator.collections.clients.get(params.id))
        @view = new ClientEditView {params, region:'content'}

