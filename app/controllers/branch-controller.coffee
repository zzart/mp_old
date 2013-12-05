Controller = require 'controllers/auth-controller'
BranchListView = require 'views/branch-list-view'
BranchAddView = require 'views/branch-add-view'
BranchEditView = require 'views/branch-edit-view'
Collection = require 'models/branch-collection'
Model = require 'models/branch-model'
mediator = require 'mediator'

module.exports = class BranchController extends Controller
    list:(params, route, options) ->
        @publishEvent('log:info', 'in branch list controller')
        # check if collection is already fetched from server
        if _.isObject(mediator.collections.branches)
            @view = new BranchListView {params , region:'content'}
        else
            mediator.collections.branches = new Collection
            console.log(mediator.collections.branches)
            mediator.collections.branches.fetch
                data: params
                beforeSend: =>
                    @publishEvent 'loading_start'
                    @publishEvent 'tell_user', 'Ładuje listę oddziałów ...'
                success: =>
                    @publishEvent('log:info', "data with #{params} fetched ok" )
                    @publishEvent 'loading_stop'
                    @view = new BranchListView {params , region:'content'}
                error: =>
                    @publishEvent 'loading_stop'
                    @publishEvent 'server_error'

    add:(params, route, options) ->
        @publishEvent('log:info', 'in branchadd controller')
        mediator.models.branch = new Model
        schema = mediator.models.user.get('schemas').branch
        mediator.models.branch.schema = schema
        @view = new BranchAddView {params, region:'content'}

    show:(params, route, options) ->
        @publishEvent('log:info', 'in branch show controller')
        @redirectTo {'/oddzialy'} unless _.isObject(mediator.collections.branches.get(params.id))
        @view = new BranchEditView {params, region:'content'}

