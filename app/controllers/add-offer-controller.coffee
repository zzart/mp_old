Controller = require 'controllers/base/controller'
AddOfferView = require 'views/add-offer-view'
Offer = require 'models/offer-model'
Schema = require 'models/schema-model'
mediator =  require 'mediator'

module.exports = class AddOfferController extends Controller
    show:(params) ->
        console.log('con: GET params ')
        console.log(params)
        @view_conf =
            content: 'add_offer_structure'
            footer: 'add_offer_footer'
            nr_pages: 3
        mediator.t_conf = @view_conf
        mediator.publish 'view:init'
        @model = new Offer
        @schema_model = new Schema
        @schema_model.fetch
            data: params
            success: =>
                console.log('con: data fetched!!')
                #BBForm expects to find schema at model.schema key ...
                @schema_model.schema = @schema_model.attributes
                @form = new Backbone.Form {model: @schema_model}
                @form.render()
                @view = new AddOfferView {model: @model , form:@form}
