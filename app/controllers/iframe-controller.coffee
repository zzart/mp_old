#Controller = require 'controllers/structure-controller'
Controller = require 'controllers/auth-controller'
View = require 'views/iframe-view'
mediator = require 'mediator'

module.exports = class IFrameController extends Controller
    show:(params)->
        @publishEvent('log:info', 'controller:home')
        @view = new View {region: 'content', template:params.template}

