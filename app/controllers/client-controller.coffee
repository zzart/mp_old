Controller = require 'controllers/auth-controller'
ListView = require 'views/client-list-view'
ClientView = require 'views/client-view'
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
                @view = new ListView {
                    collection:mediator.collections.clients
                    template:'client_list_view'
                    region:'content'
                }
            error: =>
                @publishEvent 'loading_stop'
                @publishEvent 'server_error'

    add:(params, route, options) ->
        @publishEvent('log:info', 'in clientadd controller')
        mediator.models.client = new Model
        @schema =localStorage.getObject('client_schema')
        @model = mediator.models.client
        @model.schema = _.clone(@schema)
        @view = new ClientView {form_name:'client_form', model:@model, can_edit:true, edit_type:'add',  region:'content'}

    show:(params, route, options) ->
        @publishEvent('log:info', 'in client show controller')
        @redirectTo {'/klienci'} unless _.isObject(mediator.collections.clients.get(params.id))
        @schema =localStorage.getObject('client_schema')
        @model = mediator.collections.clients.get(params.id)
        @model.schema = _.clone(@schema)
        @can_edit = mediator.can_edit(mediator.models.user.get('is_admin'),@model.get('agent'), mediator.models.user.get('id'))
        @publishEvent 'tell_viewed', @model.get_url()
        @view = new ClientView {form_name:'client_form', model:@model, can_edit:@can_edit,  region:'content'}

    dispose: ->
        # NOTE: controler by default calls this method and erases ALL attributes, binds and other stuff (even inside mediator object)
        # we need model.attributes to persist accross all controllers for quick access !
        # so before we get rid of everything let's deepCopy this obj
        @publishEvent('log:error', 'dispose method called cliet controller --------')
        deepCopy = mediator.collections.clients.clone()
        super
        mediator.collections.clients = deepCopy

