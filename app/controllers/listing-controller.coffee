#Controller = require 'controllers/structure-controller'
Controller = require 'controllers/auth-controller'
ListView = require 'views/listing-list-view'
Collection = require 'models/listing-collection'
Model = require 'models/listing-model'
View = require 'views/listing-view'
mediator =  require 'mediator'

module.exports = class ListingController extends Controller
    list:(params, route, options) ->
        mediator.last_query = _.clone(options.query)
        @publishEvent('log:info', "in list property controller#{params}, #{route}, #{options}" )
        mediator.collections.listings = new Collection
        # console.log(mediator.collections.clients)
        mediator.collections.listings.fetch
            data: options.query
            beforeSend: =>
                @publishEvent 'loading_start'
                @publishEvent 'tell_user', 'Ładuje oferty...'
            success: =>
                @publishEvent('log:info', "data with #{params} fetched ok" )
                @publishEvent 'loading_stop'
                @view = new ListView {collection:mediator.collections.listings, template:'listing_list_view' ,filter:'client_type',  region:'content'}
            error: =>
                @publishEvent 'loading_stop'
                @publishEvent 'server_error'


    add:(params, route, options) ->
        @publishEvent('log:info', "in add property controller" )
        console.log(params, route, options)
        type = options.query.type
        form = "#{type}_form"
        @schema =localStorage.getObject("#{type}_schema")
        mediator.models.property = new Model
        mediator.models.property.schema = _.clone(@schema)
        @publishEvent('log:info', "init view property controller" )
        @view = new View {form_name:form, model:mediator.models.property, listing_type: type , can_edit:true, edit_type:'add', region:'content'}
        @publishEvent('log:info', "after init view property controller" )


    show:(params, route, options) ->
        @publishEvent('log:info', 'in listing show controller')
        @redirectTo {'/oferty'} unless _.isObject(mediator.collections.listings.get(params.id))
        @model = mediator.collections.listings.get(params.id)
        categories =_.invert(localStorage.getObject('categories'))
        category = categories[@model.get('category')]
        form = "#{category}_form"
        schema = "#{category}_schema"
        @schema =localStorage.getObject(schema)
        console.log(categories, @schema, @model.get('category'))
        @model.schema = _.clone(@schema)
        @can_edit = mediator.can_edit(mediator.models.user.get('is_admin'),@model.get('agent'), mediator.models.user.get('id'))
        @view = new View {form_name:form, model:@model, can_edit:@can_edit,  region:'content' }

