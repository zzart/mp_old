Controller = require 'controllers/auth-controller'
ListView = require 'views/graphic-list-view'
View = require 'views/graphic-view'
Collection = require 'models/graphic-collection'
Model = require 'models/graphic-model'
mediator = require 'mediator'

module.exports = class GraphicController extends Controller
    list:(params, route, options) ->
        @publishEvent('log:info', 'in client list controller')
        mediator.collections.graphics = new Collection
        # console.log(mediator.collections.clients)
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
                }
            error: =>
                @publishEvent 'loading_stop'
                @publishEvent 'server_error'

    add:(params, route, options) ->
        @publishEvent('log:info', 'in graphic controller')
        mediator.models.graphic = new Model
        @schema =localStorage.getObject('graphic_schema')
        @model = mediator.models.graphic
        @model.schema = _.clone(@schema)
        @view = new View {form_name:'graphic_form', model:@model, can_edit:true, edit_type:'add',  region:'content'}

    show:(params, route, options) ->
        @publishEvent('log:info', 'in graphic show controller')
        @redirectTo {'/grafiki'} unless _.isObject(mediator.collections.graphics.get(params.id))
        @schema =localStorage.getObject('graphic_schema')
        @model = mediator.collections.graphics.get(params.id)
        @model.schema = _.clone(@schema)
        @can_edit = mediator.can_edit(mediator.models.user.get('is_admin'),@model.get('agent'), mediator.models.user.get('id'))
        @publishEvent 'tell_viewed', @model.get_url()
        @view = new View {form_name:'graphic_form', model:@model, can_edit:@can_edit,  region:'content'}

