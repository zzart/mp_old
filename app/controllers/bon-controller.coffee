Controller = require 'controllers/auth-controller'
# ClientListView = require 'views/client-list-view'
# ClientAddView = require 'views/client-add-view'
BonEditView = require 'views/bon-edit-view'
# Collection = require 'models/client-collection'
Model = require 'models/bon-model'
mediator = require 'mediator'

module.exports = class BonController extends Controller
    show:(params, route, options) ->
        console.log(params, route, options)
        @publishEvent('log:info', 'in bon show controller')
        if _.isObject(mediator.models.bon)
            @view = new BonEditView {params , region:'content'}
        else
            # since we don't have a colletion before selecting model we need to initiate model wit ID!
            # {params} so backbone doesn't think this model isNew
            mediator.models.bon = new Model {id:params.id}
            mediator.models.bon.fetch
                beforeSend: =>
                    @publishEvent 'loading_start'
                    @publishEvent 'tell_user', 'Ładuje ustawienia biura ...'
                success: =>
                    @publishEvent('log:info', "data with #{params} fetched ok" )
                    @publishEvent 'loading_stop'
                    @view = new BonEditView {params , region:'content'}
                error: =>
                    @publishEvent 'loading_stop'
                    @publishEvent 'server_error'

        #     list:(params, route, options) ->
        #         @publishEvent('log:info', 'in client list controller')
        #         # check if collection is already fetched from server
        #         if _.isObject(mediator.collections.clients)
        #             @view = new ClientListView {params , region:'content'}
        #         else
        #             mediator.collections.clients = new Collection
        #             console.log(mediator.collections.clients)
        #             mediator.collections.clients.fetch
        #                 data: params
        #                 beforeSend: =>
        #                     @publishEvent 'loading_start'
        #                     @publishEvent 'tell_user', 'Ładuje listę klentów ...'
        #                 success: =>
        #                     @publishEvent('log:info', "data with #{params} fetched ok" )
        #                     @publishEvent 'loading_stop'
        #                     @view = new ClientListView {params , region:'content'}
        #                 error: =>
        #                     @publishEvent 'loading_stop'
        #                     @publishEvent 'server_error'
        #
        #     add:(params, route, options) ->
        #         @publishEvent('log:info', 'in clientadd controller')
        #         mediator.models.client = new Model
        #         schema = mediator.models.user.get('schemas').client
        #         mediator.models.client.schema = schema
        #         @view = new ClientAddView {params, region:'content'}
        #
