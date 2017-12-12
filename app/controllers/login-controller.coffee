StructureController = require 'controllers/structure-controller'
mediator = require 'mediator'
if mediator.online is true
    LoginView = require 'views/login-view'
else
    LoginView = require 'views/login-view'
    #LoginView = require 'views/autologin-view'
Model = require 'models/login-model'

module.exports = class LoginController extends StructureController
    show: ->
        @publishEvent('log:debug', 'login show')
        mediator.models.user = new Model
        @view = new LoginView {region:'login'}

    logoff: ->
        @publishEvent('log:debug', 'login off')
        mediator.models.user = null
        Chaplin.utils.redirectTo {url: ''}
        @publishEvent 'tell_user', "Pomyślnie wylogowany"

