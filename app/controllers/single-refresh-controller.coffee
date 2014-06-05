#Controller = require 'controllers/structure-controller'
Controller = require 'controllers/auth-controller'
Model = require 'models/refresh-model'
mediator = require 'mediator'

module.exports = class SingleRefreshController extends Controller
    # for localStorage data refresh
    # NOTE: this needs to be separated from RefreshController !! as global @models get mixed up
    # with async requests !!
    initialize: ->
        @subscribeEvent('refresh_localstorage', @refresh_localstorage)

    refresh_localstorage: (model) =>
        params = {}
        params['model'] = model
        params['type'] = 'data'
        @model = new Model
        @model.fetch
            data: params
            success: =>
                @publishEvent('log:info', "data with #{params.model} #{params.type} fetched ok" )
                #NOTE: @model.get() doesn't work here as returned is an object
                if _.isObject(@model.attributes[params.model])
                    localStorage.setObject("#{params.model}", @model.attributes[params.model])
            error: =>
                @publishEvent 'tell_user', 'Brak połączenia z serwerem - dane nie zostały odświerzone'
