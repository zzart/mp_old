Controller = require 'controllers/auth-controller'
ListView = require 'views/graphic-list-view'
View = require 'views/graphic-view'
Collection = require 'models/graphic-collection'
Model = require 'models/graphic-model'
mediator = require 'mediator'

module.exports = class GraphicController extends Controller
    list:(params, route, options) ->
        @publishEvent('log:info', 'in graphic list controller ---------')
        route_params = [params, route, options]
        mediator.collections.graphics = new Collection
        mediator.collections.graphics.fetch
            data: params
            beforeSend: =>
                @publishEvent 'loading_start'
                @publishEvent 'tell_user', 'Ładuje listę grafik ...'
            success: =>
                @publishEvent('log:info', "data with #{params} fetched ok" )
                @publishEvent 'loading_stop'
                @view = new ListView {
                    collection:mediator.collections.graphics
                    template:'graphic_list_view'
                    region:'content'
                    route_params: route_params
                }
            error: =>
                @publishEvent 'loading_stop'
                @publishEvent 'server_error'

    add:(params, route, options) ->
        @publishEvent('log:info', 'in graphic controller')
        route_params = [params, route, options]
        mediator.models.graphic = new Model
        @schema =localStorage.getObject('graphic_schema')
        @model = mediator.models.graphic
        @model.schema = _.clone(@schema)
        @view = new View {
            form_name:'graphic_form'
            model:@model
            can_edit:true
            edit_type:'add'
            region:'content'
            route_params: route_params
        }

    show:(params, route, options) ->
        @publishEvent('log:info', 'in graphic show controller')
        route_params = [params, route, options]
        @redirectTo {'/grafiki'} unless _.isObject(mediator.collections.graphics.get(params.id))
        @schema =localStorage.getObject('graphic_schema')
        @model = mediator.collections.graphics.get(params.id)
        @model.schema = _.clone(@schema)
        @can_edit = mediator.can_edit(mediator.models.user.get('is_admin'),@model.get('agent'), mediator.models.user.get('id'))
        @publishEvent 'tell_viewed', @model.get_url()
        @view = new View {
            form_name:'graphic_form'
            model:@model
            can_edit:@can_edit
            region:'content'
            route_params: route_params
        }

    dispose: ->
        # NOTE: controler by default calls this method and erases ALL attributes, binds and other stuff (even inside mediator object)
        # we need model.attributes to persist accross all controllers for quick access !
        # so before we get rid of everything let's deepCopy this obj
        @publishEvent('log:info', 'dispose method called graphic controller --------')
        deepCopy = mediator.collections.graphics.clone()
        super
        mediator.collections.graphics = deepCopy

