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
        @schema =localStorage.getObject('import_schema')
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
        @publishEvent('log:info', 'in import show controller')
        route_params = [params, route, options]
        @redirectTo {'/importy'} unless _.isObject(mediator.collections.imports.get(params.id))
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

