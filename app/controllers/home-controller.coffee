#Controller = require 'controllers/structure-controller'
Controller = require 'controllers/auth-controller'
HomePageView = require 'views/home-page-view'
mediator = require 'mediator'

module.exports = class HomeController extends Controller
    show: ->
        @publishEvent('log:debug', 'HomeController')
        @view = new HomePageView {region: 'content'}

