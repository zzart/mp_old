Controller = require 'controllers/auth-controller'
ListView = require 'views/export-list-view'
View = require 'views/export-view'
Collection = require 'models/export-collection'
Model = require 'models/export-model'
mediator = require 'mediator'

module.exports = class ExportController extends Controller
    list:(params, route, options) ->
        @publishEvent('log:info', 'in client list controller')
        route_params = [params, route, options]
        mediator.collections.exports = new Collection
        # console.log(mediator.collections.clients)
        mediator.collections.exports.fetch
            data: params
            beforeSend: =>
                @publishEvent 'loading_start'
                @publishEvent 'tell_user', 'Ładuje listę eksportów ...'
            success: =>
                @publishEvent('log:info', "data with #{params} fetched ok" )
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
        @publishEvent('log:info', 'in export add controller')
        route_params = [params, route, options]
        mediator.models.export = new Model
        @schema =localStorage.getObject('export_schema')
        @model = mediator.models.export
        @model.schema = _.clone(@schema)
        @view = new View {
            form_name:'export_form'
            model:@model
            can_edit:true
            edit_type:'add'
            region:'content'
            route_params: route_params
        }

    show:(params, route, options) ->
        @publishEvent('log:info', 'in export show controller')
        route_params = [params, route, options]
        @redirectTo {'/eksporty'} unless _.isObject(mediator.collections.exports.get(params.id))
        @schema =localStorage.getObject('export_schema')
        @model = mediator.collections.exports.get(params.id)
        @model.schema = _.clone(@schema)
        @can_edit = mediator.can_edit(mediator.models.user.get('is_admin'),@model.get('agent'), mediator.models.user.get('id'))
        @publishEvent 'tell_viewed', @model.get_url()
        @view = new View {
            form_name:'export_form'
            model:@model
            can_edit:@can_edit
            region:'content'
            route_params: route_params
        }


    dispose: ->
        # NOTE: controler by default calls this method and erases ALL attributes, binds and other stuff (even inside mediator object)
        # we need model.attributes to persist accross all controllers for quick access !
        # so before we get rid of everything let's deepCopy this obj
        @publishEvent('log:info', 'dispose method called exports controller --------')
        deepCopy = mediator.collections.exports.clone()
        super
        mediator.collections.exports = deepCopy

