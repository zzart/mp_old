Controller = require 'controllers/auth-controller'
ListView = require 'views/branch-list-view'
View = require 'views/branch-view'
Collection = require 'models/branch-collection'
Model = require 'models/branch-model'
mediator = require 'mediator'

module.exports = class BranchController extends Controller

    dispose: ->
        # NOTE: controler by default calls this method and erases ALL attributes, binds and other stuff (even inside mediator object)
        # we need model.attributes to persist accross all controllers for quick access !
        # so before we get rid of everything let's deepCopy this obj
        @publishEvent('log:error', 'dispose method called branch controller --------')
        deepCopy = mediator.collections.branches.clone()
        super
        mediator.collections.branches = deepCopy
        @test_attributes()

    list:(params, route, options) ->
        @publishEvent('log:info', 'in branch list controller')
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
                @publishEvent('log:info', "data with #{params} fetched ok" )
                @publishEvent 'loading_stop'
                @view = new ListView {
                    collection: mediator.collections.branches
                    template:'branch_list_view'
                    region:'content'
                    controller: 'branch_controller'
                }
            error: =>
                @publishEvent 'loading_stop'
                @publishEvent 'server_error'

    add:(params, route, options) ->
        @publishEvent('log:info', 'in branchadd controller')
        mediator.models.branch = new Model
        @model = mediator.models.branch
        @schema = localStorage.getObject('branch_schema')
        @model.schema = _.clone(@schema)
        @can_edit = mediator.can_edit(mediator.models.user.get('is_admin'),1,0)
        @view = new View {form_name:'branch_form', model:@model, can_edit:@can_edit, region:'content'}

    show:(params, route, options) ->
        @publishEvent('log:info', 'in branch show controller')
        @redirectTo {'/oddzialy'} unless _.isObject(mediator.collections.branches.get(params.id))
        @model = mediator.collections.branches.get(params.id)
        window.modell = @model
        @schema = localStorage.getObject('branch_schema')
        @model.schema = _.clone(@schema)
        @can_edit = mediator.can_edit(mediator.models.user.get('is_admin'),1,0)
        @publishEvent 'tell_viewed', @model.get_url()
        @view = new View {form_name:'branch_form', model:@model, can_edit:@can_edit, region:'content'}

