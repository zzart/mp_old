Controller = require 'controllers/auth-controller'
ListView = require 'views/branch-list-view'
View = require 'views/branch-view'
Collection = require 'models/branch-collection'
Model = require 'models/branch-model'
mediator = require 'mediator'

module.exports = class BranchController extends Controller

    list:(params, route, options) ->
        @publishEvent('log:debug', 'in branch list controller')
        route_params = [params, route, options]
        # check if collection is already fetched from server
        # NOTE: this is so after save operation we don't do unnessesery fetch
        # loosing item data in the process - for quick view
        mediator.collections.branches = new Collection
        mediator.collections.branches.fetch
            data: params
            beforeSend: =>
                @publishEvent 'loading_start'
                @publishEvent 'tell_user', 'Ładuje listę oddziałów ...'
            success: =>
                @publishEvent('log:debug', "data with #{params} fetched ok" )
                @publishEvent 'loading_stop'
                @view = new ListView {
                    collection: mediator.collections.branches
                    template:'branch_list_view'
                    region:'content'
                    controller: 'branch_controller'
                    route_params: route_params
                }
            error: =>
                @publishEvent 'loading_stop'
                @publishEvent 'server_error'

    add:(params, route, options) ->
        @publishEvent('log:debug', 'in branchadd controller')
        route_params = [params, route, options]
        mediator.models.branch = new Model
        @model = mediator.models.branch
        @view = new View {
            model:@model
            region:'content'
            route_params: route_params
        }

    show:(params, route, options) ->
        @publishEvent('log:debug', 'in branch show controller')
        route_params = [params, route, options]
        @redirectTo {'/oddzialy'} unless _.isObject(mediator.collections.branches.get(params.id))
        @model = mediator.collections.branches.get(params.id)
        window.modell = @model
        @publishEvent 'tell_viewed', @model.get_url()
        @view = new View {
            model:@model
            region:'content'
            route_params: route_params
        }


    dispose: ->
        # NOTE: controler by default calls this method and erases ALL attributes, binds and other stuff (even inside mediator object)
        # we need model.attributes to persist accross all controllers for quick access !
        # so before we get rid of everything let's deepCopy this obj
        @publishEvent('log:debug', 'dispose method called branch controller --------')
        deepCopy = mediator.collections.branches.clone()
        super
        mediator.collections.branches = deepCopy
