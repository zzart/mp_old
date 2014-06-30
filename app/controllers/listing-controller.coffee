#Controller = require 'controllers/structure-controller'
Controller = require 'controllers/auth-controller'
ListView = require 'views/listing-list-view'
Collection = require 'models/listing-collection'
Model = require 'models/listing-model'
View = require 'views/listing-view'
mediator =  require 'mediator'

module.exports = class ListingController extends Controller
    list:(params, route, options) ->
        @publishEvent('log:debug', "in list property controller#{params}, #{route}, #{options}" )
        mediator.last_query = _.clone(options.query)
        listing_type = options.query.category
        mediator.collections.listings = new Collection
        mediator.collections.listings.query_add(options.query)
        mediator.collections.listings.fetch
            data: mediator.collections.listings.query
            #beforeSend: =>
            #    @publishEvent 'tell_user', 'Ładuje oferty...'
            success: =>
                @publishEvent('log:debug', "data with #{params} fetched ok" )
                @view = new ListView {
                    collection:mediator.collections.listings
                    template: "listing_list_view"
                    filter:'status'
                    region:'content'
                    listing_type: listing_type
                    controller: 'listing_controller'
                }
            error: =>
                @publishEvent 'server_error'


    add:(params, route, options) ->
        @publishEvent('log:info', "in add property controller" )
        console.log(params, route, options)
        listing_type = options.query.type
        form = "#{listing_type}_form"
        @schema =localStorage.getObject("#{listing_type}_schema")
        mediator.models.listing = new Model
        mediator.models.listing.schema = _.clone(@schema)
        @publishEvent('log:debug', "init view property controller" )
        @view = new View {
            form_name: form,
            model:mediator.models.listing
            listing_type: listing_type
            can_edit:true
            edit_type: 'add'
            region: 'content'
        }
        @publishEvent('log:debug', "after init view property controller" )


    show:(params, route, options) ->
        @publishEvent('log:debug', 'in listing show controller')
        url = "/oferty?#{$.param(mediator.last_query)}"
        # @redirectTo {url} unless _.isObject(mediator.collections.listings.get(params.id))
        if _.isObject(mediator.collections.listings?.get(params.id))
            @model = mediator.collections.listings.get(params.id)
            categories =_.invert(localStorage.getObject('categories'))
            category = categories[@model.get('category')]
            form = "#{category}_form"
            schema = "#{category}_schema"
            @schema =localStorage.getObject(schema)
            # console.log(categories, @schema, @model.get('category'))
            @model.schema = _.clone(@schema)
            @can_edit = mediator.can_edit(mediator.models.user.get('is_admin'),@model.get('agent'), mediator.models.user.get('id'))
            @publishEvent 'tell_viewed', @model.get_url()
            @view = new View {
                form_name:form
                model:@model
                can_edit:@can_edit
                region:'content'
            }
        else
            mediator.models.listing = new Model
            @model = mediator.models.listing
            @model.set('id', params.id)
            @model.fetch
            # data: {id: params.id}
                success: =>
                    @publishEvent('log:info', "data with #{params} fetched ok" )
                    categories =_.invert(localStorage.getObject('categories'))
                    category = categories[@model.get('category')]
                    form = "#{category}_form"
                    schema = "#{category}_schema"
                    @schema =localStorage.getObject(schema)
                    # console.log(categories, @schema, @model.get('category'))
                    @model.schema = _.clone(@schema)
                    @can_edit = mediator.can_edit(mediator.models.user.get('is_admin'),@model.get('agent'), mediator.models.user.get('id'))
                    @publishEvent 'tell_viewed', @model.get_url()
                    @view = new View {
                        form_name:form
                        model:@model
                        can_edit:@can_edit
                        region:'content'
                    }

                error: =>
                    @publishEvent 'server_error'


