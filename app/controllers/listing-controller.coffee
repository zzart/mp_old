#Controller = require 'controllers/structure-controller'
Controller = require 'controllers/auth-controller'
# OfferListView = require 'views/offer-list-view'
Collection = require 'models/offer-list-collection'
Model = require 'models/property-model'
AddView = require 'views/listing-add-view'
mediator =  require 'mediator'

module.exports = class ListingController extends Controller
    # list:(params, route, options) ->
    #     @publishEvent('log:info', "in list property controller" )
    #     @collection = new Collection
    #     @collection.fetch
    #         data: params
    #         beforeSend: =>
    #             @publishEvent 'loading_start'
    #             @publishEvent 'tell_user', 'Ładuje oferty...'
    #         success: =>
    #             @publishEvent('log:info', "data with #{params} fetched ok" )
    #             @publishEvent 'loading_stop'
    #             @view = new OfferListView {@collection, params, region:'content'}
    #         error: =>
    #             @publishEvent 'loading_stop'
    #             @publishEvent 'server_error'


    add:(params, route, options) ->
        @publishEvent('log:info', "in add property controller" )
        console.log(params, route, options)
        type = options.query.type
        form = "#{type}_form"
        @schema =localStorage.getObject('schemas')[type]
        mediator.models.property = new Model
        mediator.models.property.schema = _.clone(@schema)
        @publishEvent('log:info', "init view property controller" )
        @view = new AddView {form_name:form, model:mediator.models.property, listing_type: type , can_edit:true, edit_type:'add', region:'content'}
        @publishEvent('log:info', "after init view property controller" )

    show:(params, route, options) ->
        @publishEvent('log:info', "in show property controller" )
        # form.render()

