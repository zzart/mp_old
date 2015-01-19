Controller = require 'controllers/auth-controller'
ListView = require 'views/import-list-view'
View = require 'views/import-view'
Collection = require 'models/import-collection'
Model = require 'models/import-model'
mediator = require 'mediator'

module.exports = class ImportController extends Controller
    list:(params, route, options) ->
        @publishEvent('log:info', 'in client list controller')
        route_params = [params, route, options]
        mediator.collections.imports = new Collection
        # console.log(mediator.collections.clients)
        mediator.collections.imports.fetch
            data: params
            beforeSend: =>
                @publishEvent 'loading_start'
                @publishEvent 'tell_user', 'Ładuje listę importów ...'
            success: =>
                @publishEvent('log:info', "data with #{params} fetched ok" )
                @publishEvent 'loading_stop'
                @view = new ListView {
                    collection:mediator.collections.imports
                    template:'import_list_view'
                    region:'content'
                    route_params: route_params
                }
            error: =>
                @publishEvent 'loading_stop'
                @publishEvent 'server_error'

    add:(params, route, options) ->
        @publishEvent('log:info', 'in import controller')
        route_params = [params, route, options]
        mediator.models.export = new Model
        @model = mediator.models.export
        @view = new View {
            model:@model
            region:'content'
            route_params: route_params
        }

    show:(params, route, options) ->
        @publishEvent('log:info', 'in import show controller')
        route_params = [params, route, options]
        @redirectTo {'/importy'} unless _.isObject(mediator.collections.imports.get(params.id))
        @model = mediator.collections.exports.get(params.id)
        @publishEvent 'tell_viewed', @model.get_url()
        @view = new View {
            model:@model
            region:'content'
            route_params: route_params
        }

