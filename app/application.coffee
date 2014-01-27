#Chaplin = require 'chaplin'
StructureController = require 'controllers/structure-controller'
RefreshController = require 'controllers/refresh-controller'
Layout = require 'views/layout'
mediator = require 'mediator'
routes = require 'routes'

# The application object
module.exports = class Application extends Chaplin.Application
  # Set your application name here so the document title is set to
  # “Controller title – Site title” (see Layout#adjustTitle)
  title: 'Mobilny Pośrednik'

  initialize: ->
    super

    # Initialize core components
    #@initDispatcher controllerSuffix: '-controller'
    #initDispatcher: (options = {}) ->
    #    @dispatcher = new Dispatcher controllerSuffix = '-controller'
    # @initLayout()
    # @initMediator()

    # Application-specific scaffold
    @initControllers()

    # Register all routes and start routing
    #@initRouter options.routes, options
    #@initRouter routes
    # You might pass Router/History options as the second parameter.
    # Chaplin enables pushState per default and Backbone uses / as
    # the root per default. You might change that in the options
    # if necessary:
    # initRouter: ->
    #     pushState: false # , root: '/subdir/'
    # @initRouter routes, pushState: false # , root: '/subdir/'
    # @initRouter routes, pushState: false
    # @initRouter routes
    # @start()

    # Freeze the application instance to prevent further changes
    Object.freeze? this

  # Override standard layout initializer
  # ------------------------------------
  initLayout: ->
    # Use an application-specific Layout class. Currently this adds
    # no features to the standard Chaplin Layout, it’s an empty placeholder.
    @layout = new Layout {@title}

  # Instantiate common controllers
  # ------------------------------
  initControllers: ->
    # These controllers are active during the whole application runtime.
    # You don’t need to instantiate all controllers here, only special
    # controllers which do not to respond to routes. They may govern models
    # and views which are needed the whole time, for example header, footer
    # or navigation views.
    # e.g. new NavigationController()
    new StructureController()
    new RefreshController()

  # Create additional mediator properties
  # -------------------------------------
  initMediator: ->
    # Add additional application-specific properties and methods
    # e.g. mediator.prop = null
    mediator.models = {}
    mediator.collections = {}
    mediator.schemas = {}
    mediator.upload_url = 'http://localhost:8080/v1/dodaj-plik'
    mediator.app_key = 'mp'
    mediator.app = '4ba2b78a-5675-42d9-8aab-f65ecf3ce9ba'
    mediator.can_edit = (is_admin, author_id, user_id) ->
        if is_admin
            return true
        if author_id == user_id
            return true
        return false
    # Seal the mediator
    mediator.gen_token = (url) =>
        apphash = CryptoJS.HmacSHA256(url, mediator.app_key)
        apphash_hexed = apphash.toString(CryptoJS.enc.Hex)
        userhash = CryptoJS.HmacSHA256(url, mediator.models.user.get('user_pass'))
        userhash_hexed = userhash.toString(CryptoJS.enc.Hex)
        header_string = "#{mediator.app},#{apphash_hexed},#{mediator.models.user.get('username')}@#{mediator.models.user.get('company_name')},#{userhash_hexed}"
        auth_header = btoa(header_string)

    mediator.seal()
