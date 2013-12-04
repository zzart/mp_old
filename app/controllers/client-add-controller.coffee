#Controller = require 'controllers/structure-controller'
Controller = require 'controllers/auth-controller'
ClientAddView = require 'views/client-add-view'
Model = require 'models/client-model'
mediator =  require 'mediator'

module.exports = class ClientAddController extends Controller
    show:(params, route, options) ->
        @publishEvent('log:info', 'in clientadd controller')
        @publishEvent('log:debug', params)
        @publishEvent('log:debug', route)
        @publishEvent('log:debug', options)
        mediator.models.client = new Model
        schema = mediator.models.user.get('schemas').client
        mediator.models.client.schema = schema
        @view = new ClientAddView {params, region:'content'}
