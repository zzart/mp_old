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
        @publishEvent('log:info', 'login show')
        mediator.models.user = new Model
        @view = new LoginView {region:'login'}

        #moved to left panel view
        #logoff: ->
        #logo@publishEvent('log:info', 'login off')
        #logomediator.models.user = null
        #logoChaplin.utils.redirectTo {url: ''}
        #logo@publishEvent 'tell_user', "Pomyślnie wylogowany"

