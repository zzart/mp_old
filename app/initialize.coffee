Application = require 'application'
routes = require 'routes'
# Initialize the application on DOM ready event.
#$ ->
#  app = new Application()
#  app.initialize()

# Initialize the application on DOM ready event.
$ ->
    new Application {
        controllerSuffix: '-controller', pushState: false, routes: routes
    }

