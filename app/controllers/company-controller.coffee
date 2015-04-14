Controller = require 'controllers/auth-controller'
View = require 'views/company-view'
Model = require 'models/company-model'
mediator = require 'mediator'

module.exports = class CompanyController extends Controller

    show:(params, route, options) ->
        route_params = [params, route, options]
        @publishEvent('log:debug', 'in bon show controller')
        if _.isObject(mediator.models.company)
            @view = new View {
                model:mediator.models.company
                region:'content'
                route_params: route_params
            }
        else
            # since we don't have a colletion before selecting model we need to initiate model wit ID!
            # {params} so backbone doesn't think this model isNew
            mediator.models.company = new Model {id:params.id}
            mediator.models.company.fetch
                beforeSend: =>
                    @publishEvent 'loading_start'
                    @publishEvent 'tell_user', 'Ładuje ustawienia biura ...'
                success: =>
                    @publishEvent('log:debug', "data with #{params} fetched ok" )
                    @publishEvent 'loading_stop'
                    @view = new View {
                        model:mediator.models.company
                        region:'content'
                        route_params: route_params
                    }
                error: =>
                    @publishEvent 'loading_stop'
                    @publishEvent 'server_error'

