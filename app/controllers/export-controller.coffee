Controller = require 'controllers/auth-controller'
ListView = require 'views/export-list-view'
View = require 'views/export-view'
Collection = require 'models/export-collection'
Model = require 'models/export-model'
mediator = require 'mediator'

module.exports = class ExportController extends Controller
    list:(params, route, options) ->
        @publishEvent('log:debug', 'in client list controller')
        route_params = [params, route, options]
        mediator.collections.exports = new Collection
        # console.log(mediator.collections.clients)
        mediator.collections.exports.fetch
            data: params
            beforeSend: =>
                @publishEvent 'loading_start'
                @publishEvent 'tell_user', 'Ładuje listę eksportów ...'
            success: =>
                @publishEvent('log:debug', "data with #{params} fetched ok" )
                @publishEvent 'loading_stop'
                @view = new ListView {
                    collection:mediator.collections.exports
                    template:'export_list_view'
                    region:'content'
                    route_params: route_params
                }
            error: =>
                @publishEvent 'loading_stop'
                @publishEvent 'server_error'

    add:(params, route, options) ->
        @publishEvent('log:debug', 'in export add controller')
        route_params = [params, route, options]
        mediator.models.export = new Model
        @model = mediator.models.export
        @view = new View {
            model:@model
            region:'content'
            route_params: route_params
        }

    show:(params, route, options) ->
        @publishEvent('log:debug', 'in export show controller')
        route_params = [params, route, options]
        @redirectTo {'/eksporty'} unless _.isObject(mediator.collections.exports.get(params.id))
        @model = mediator.collections.exports.get(params.id)
        @publishEvent 'tell_viewed', @model.get_url()
        @view = new View {
            model:@model
            region:'content'
            route_params: route_params
        }


    dispose: ->
        # NOTE: controler by default calls this method and erases ALL attributes, binds and other stuff (even inside mediator object)
        # we need model.attributes to persist accross all controllers for quick access !
        # so before we get rid of everything let's deepCopy this obj
        @publishEvent('log:debug', 'dispose method called exports controller --------')
        deepCopy = mediator.collections.exports.clone()
        super
        mediator.collections.exports = deepCopy

