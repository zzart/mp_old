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

    # this gets objects in and out from localstorage
    Storage.prototype.setObject = (key, value) ->
        this.setItem(key, JSON.stringify(value))

    Storage.prototype.getObject = (key) ->
        value = this.getItem(key)
        value && JSON.parse(value)

