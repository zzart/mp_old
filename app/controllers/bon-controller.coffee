Controller = require 'controllers/auth-controller'
View = require 'views/bon-view'
Model = require 'models/bon-model'
mediator = require 'mediator'

module.exports = class BonController extends Controller
    show:(params, route, options) ->
        console.log(params, route, options)
        @can_edit = mediator.can_edit(mediator.models.user.get('is_admin'),1,0)
        @schema =localStorage.getObject('schemas').company
        @publishEvent('log:info', 'in bon show controller')
        if _.isObject(mediator.models.bon)
            mediator.models.bon.schema = _.clone(@schema)
            @view = new View {form_name:'bon_form', model:mediator.models.bon, can_edit:@can_edit,  region:'content'}
        else
            # since we don't have a colletion before selecting model we need to initiate model wit ID!
            # {params} so backbone doesn't think this model isNew
            mediator.models.bon = new Model {id:params.id}
            mediator.models.bon.schema = _.clone(@schema)
            mediator.models.bon.fetch
                beforeSend: =>
                    @publishEvent 'loading_start'
                    @publishEvent 'tell_user', 'Ładuje ustawienia biura ...'
                success: =>
                    @publishEvent('log:info', "data with #{params} fetched ok" )
                    @publishEvent 'loading_stop'
                    @view = new View {form_name:'bon_form', model:mediator.models.bon, can_edit:@can_edit,  region:'content'}
                error: =>
                    @publishEvent 'loading_stop'
                    @publishEvent 'server_error'

