#Controller = require 'controllers/structure-controller'
Controller = require 'controllers/auth-controller'
Model = require 'models/refresh-model'
mediator = require 'mediator'

module.exports = class SingleRefreshController extends Controller
    # for localStorage data refresh
    # NOTE: this needs to be separated from RefreshController !! as global @models get mixed up
    # with async requests !!
    initialize: ->
        @subscribeEvent('localstorage:refresh', @refresh_localstorage)
        @subscribeEvent('localstorage:updated', @update_schema)

    refresh_localstorage: (model) =>
        # after change in name need to regenerate forms and localStorage
        # all needs to take off with a slight delay so that model has a chance to save itself
        self = @
        _.delay(->
            self = self
            params = {}
            params['model'] = model
            params['type'] = 'data'
            @model = new Model
            @model.fetch
                data: params
                success: =>
                    self.publishEvent('log:info', "data with #{params.model} #{params.type} fetched ok" )
                    #NOTE: @model.get() doesn't work here as returned is an object
                    if _.isObject(@model.attributes[params.model])
                        localStorage.setObject("#{params.model}", @model.attributes[params.model])
                        self.publishEvent 'localstorage:updated', model
                error: =>
                    #self.publishEvent 'tell_user', 'Brak połączenia z serwerem - dane nie zostały odświerzone'
                    console.log('error')
        , 30)

    update_schema: (model) ->
        @publishEvent('log:info', "update_schema of #{model}" )
        # every time localStorage is updated
        # instead of refreshing every single schema conserned
        # we can make some rules here and use data from localStorage to
        # just update schema according to these rules
        listings = [
            'flat_rent_schema',
            'flat_sell_schema' ,
            'house_rent_schema',
            'house_sell_schema',
            'land_rent_schema',
            'land_sell_schema',
            'object_rent_schema',
            'object_sell_schema',
            'warehouse_rent_schema',
            'warehouse_sell_schema',
            'commercial_rent_schema',
            'commercial_sell_schema',
        ]
        if model == 'clients'
            #console.log('test')
            # get client from each schema and replace it with a new one
            for sh in listings
                # clone schema
                oldsh = _.clone(localStorage.getObject(sh))
                # replace certain entries
                oldsh.client.options = localStorage.getObjectForSchema('clients')
                localStorage.setObject(sh, oldsh)
        @publishEvent('log:info', "update_schema of #{model} done !" )
