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

    Storage.prototype.getObjectNames = (key) ->
        # NOTE: this is very ungeneric as we assuming that all items
        # will have first_name and surname ... this is so we don't lose
        # compatibility
        # but we can do some switching depending on key if needed
        obj = {}
        for item in JSON.parse(this.getItem(key))
            obj["#{item.id}"] = "#{item.first_name} #{item.surname}"
        return obj

    Storage.prototype.getObjectForSchema = (key) ->
        # NOTE: this is very ungeneric as we assuming that all items
        # will have first_name and surname ... this is so we don't lose
        # compatibility
        # but we can do some switching depending on key if needed
        arr = []
        for item in JSON.parse(this.getItem(key))
            arr.push({val:"#{item.id}", label: "#{item.first_name} #{item.surname}"})
        return arr
