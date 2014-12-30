#Controller = require 'controllers/structure-controller'
Controller = require 'controllers/auth-controller'
Model = require 'models/refresh-model'
mediator = require 'mediator'

module.exports = class RefreshController extends Controller
    # NOTE: this needs to be separated from SingleRefreshController !!
    # as global variable @models gets mixed up with async requests !!
    initialize: ->
        @subscribeEvent('refreshmodel', @refresh_model)
        @subscribeEvent('modelchanged', @refresh_dependencies)

    refresh_model: (model, callback) ->
        #accepts 'model/form or schema' str
        #@publishEvent('log:info', "refresh called with #{model} param")
        @callback = callback
        data = model.split('/')
        params = {}
        params['model'] = data[0]
        params['type'] = data[1]
        @model = new Model
        @model.fetch
            data: params
            success: =>
                @publishEvent('log:info', "data with #{params.model}_#{params.type} fetched ok" )
                #NOTE: @model.get() doesn't work here as returned is an object
                #console.log(@model.attributes, @model.attributes[params.type])
                if _.isObject(@model.attributes[params.type]["#{params.model}_#{params.type}"])
                    localStorage.setObject("#{params.model}_#{params.type}",
                    @model.attributes[params.type]["#{params.model}_#{params.type}"])
                    @callback?()
            error: =>
                @publishEvent 'tell_user', 'Brak połączenia z serwerem - formularze nie zostały odświerzone'
                @callback?()

    refresh_dependencies: (model) =>
        #NOTE: we want to use async queue in order to fetch all dependencies and refresh schemas/ forms
        #async relays on callback f() to be notyfied went we want the called f() to return
        # TODO: doing it in series is slow and involves multiple requests + involves additional lib
        # let's make it into one !!

        self = @
        async.series([
            (callback) ->
                self.refresh_model('flat_rent/schema' , callback )
            (callback) ->
                self.refresh_model('flat_sell/schema' , callback )
            (callback) ->
                self.refresh_model('house_rent/schema', callback )
            (callback) ->
                self.refresh_model('house_sell/schema', callback )
            (callback) ->
                self.refresh_model('land_rent/schema', callback )
            (callback) ->
                self.refresh_model('land_sell/schema', callback )
            (callback) ->
                self.refresh_model('object_rent/schema', callback )
            (callback) ->
                self.refresh_model('object_sell/schema', callback )
            (callback) ->
                self.refresh_model('warehouse_rent/schema', callback )
            (callback) ->
                self.refresh_model('warehouse_sell/schema', callback )
            (callback) ->
                self.refresh_model('commercial_rent/schema', callback )
            (callback) ->
                self.refresh_model('commercial_sell/schema', callback )
        ])
