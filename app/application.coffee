#Chaplin = require 'chaplin'
StructureController = require 'controllers/structure-controller'
RefreshController = require 'controllers/refresh-controller'
SingleRefreshController = require 'controllers/single-refresh-controller'
Layout = require 'views/layout'
mediator = require 'mediator'
routes = require 'routes'

# The application object
module.exports = class Application extends Chaplin.Application
  # Set your application name here so the document title is set to
  # “Controller title – Site title” (see Layout#adjustTitle)
  title: 'MobilnyPośrednik'

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
    @checkBrowser()

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
    new SingleRefreshController()
  # Create additional mediator properties
  # -------------------------------------
  initMediator: ->
    # Add additional application-specific properties and methods
    # e.g. mediator.prop = null
    # # # # # # # # # # # # # #
    mediator.stand_alone = false
    mediator.online = false
    mediator.mobile = false
    # # # # # # # # # # # # # #
    mediator.models = {}
    mediator.collections = {}
    mediator.schemas = {}
    mediator.last_query = {}
    mediator.info = []
    mediator.viewed = []
    mediator.temp_model = {}
    if mediator.online is true
        mediator.server_url = 'http://mps.mobilnyposrednik.pl/'
        mediator.static_url = 'http://app.mobilnyposrednik.pl/'
    else
        mediator.server_url = 'http://localhost:8080/'
        mediator.static_url = ''
        console.log(mediator.server_url)
    mediator.upload_url = "#{mediator.server_url}v1/pliki"
    mediator.app_key = 'mp'
    mediator.app = 'd5260e35-868a-4b4d-861f-dbcc93d146d3'
    # Seal the mediator
    mediator.gen_token = (url) =>
        apphash = CryptoJS.HmacSHA256(url, mediator.app_key)
        apphash_hexed = apphash.toString(CryptoJS.enc.Hex)
        userhash = CryptoJS.HmacSHA256(url, mediator.models.user.get('user_pass'))
        userhash_hexed = userhash.toString(CryptoJS.enc.Hex)
        header_string = "#{mediator.app},#{apphash_hexed},#{mediator.models.user.get('username')}@#{mediator.models.user.get('company_name')},#{userhash_hexed}"
        if mediator.online is false
            console.info("get_token url: #{url}, apphash_hexed: #{apphash_hexed},
                userhash:#{userhash}, userhash_hexed:#{userhash_hexed}")
        auth_header = btoa(header_string)

    mediator.seal()

    # for debugging
    if mediator.online is false
        window.mediator = mediator
    # Offline.options = {checks: {xhr: {url: "#{mediator.server_url}ping"}}}

  checkBrowser: ->
    # check for browser compatybilty
    if not bowser.a
        alert("Mamy podejrzenia że używasz przeglądarki, która jest stara albo nie wspiera wszystkich funkcjonalności Mobilnego Pośrednika! \
        Wykryliśmy #{bowser.name}/#{bowser.version}\
        MobilnyPośrednik testowany jest TYLKO na najnowszych darmowych przeglądarkach dlatego prosimy o akutalizaję!")
    if not (bowser.name is 'Firefox' and parseInt(bowser.version) >= 30)  and not (bowser.name is 'Chrome' and parseInt(bowser.version) >= 35)
        alert('''Mamy podejrzenia, że nie używasz przeglądarki Firefox lub Chrome w najnowszej wersji...
        MobilnyPośrednik testowany jest TYLKO na najnowszych darmowych przeglądarkach dlatego prosimy o akutalizaję!''')
