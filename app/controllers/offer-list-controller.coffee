Controller = require 'controllers/structure-controller'
OfferListView = require 'views/offer-list-view'
Collection = require 'models/offer-list-collection'
mediator =  require 'mediator'

module.exports = class OfferListController extends Controller
    show:(params, route, options) ->
        @collection = new Collection
        @collection.fetch
            data: params
            beforeSend: =>
                @publishEvent 'loading_start'
                @publishEvent 'tell_user', 'Ładuje oferty...'
            success: =>
                @publishEvent('log:info', "data with #{params} fetched ok" )
                @publishEvent 'loading_stop'
                @view = new OfferListView {@collection, params, region:'content'}
            error: =>
                @publishEvent 'loading_stop'
                @publishEvent 'server_error'
