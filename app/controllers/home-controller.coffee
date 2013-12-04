#Controller = require 'controllers/structure-controller'
Controller = require 'controllers/auth-controller'
HomePageView = require 'views/home-page-view'

module.exports = class HomeController extends Controller
    show: ->
        @publishEvent('log:info', 'controller:home')
        @view = new HomePageView {region: 'content'}

