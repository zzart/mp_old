StructureController = require 'controllers/structure-controller'
#LoginView = require 'views/login-view'
LoginView = require 'views/autologin-view'
Model = require 'models/login-model'
mediator = require 'mediator'

module.exports = class LoginController extends StructureController
    show: ->
        @publishEvent('log:info', 'login controller')
        mediator.models.user = new Model
        @view = new LoginView {region:'login'}

