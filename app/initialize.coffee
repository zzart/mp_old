Application = require 'application'
# mediator = require 'mediator'
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
    Storage::setObject = (key, value) ->
        @.setItem(key, JSON.stringify(value))

    Storage::getObject = (key) ->
        value = @.getItem(key)
        value && JSON.parse(value)

    Storage::getObjectNames = (key) ->
        # NOTE: this is very ungeneric as we assuming that all items
        # will have first_name and surname ... this is so we don't lose
        # compatibility
        # but we can do some switching depending on key if needed
        obj = {}
        for item in JSON.parse(@.getItem(key))
            obj["#{item.id}"] = "#{item.first_name} #{item.surname}"
        return obj

    Storage::getObjectForSchema = (key) ->
        # NOTE: this is very ungeneric as we assuming that all items
        # will have first_name and surname ... this is so we don't lose
        # compatibility
        # but we can do some switching depending on key if needed
        arr = []
        for item in JSON.parse(@.getItem(key))
            arr.push({val:"#{item.id}", label: "#{item.first_name} #{item.surname}"})
        return arr

    Storage::getSizes = ->
        for x,val of localStorage
            console.log("#{x} = #{((localStorage[x].length * 2)/1024/1024).toFixed(2)} MB")

    Storage::getTotal = ->
        console.log("#{((unescape(encodeURIComponent(JSON.stringify(localStorage))).length *2)/1024/1024).toFixed(2)} MB")

    jQuery.fn.exists = ->
        # convience method for checking if selector is found
        @length != 0

# check for online status every 10 sec
# if mediator.online
# window.setInterval(Offline.check, 20000)

# Offline.on('up', upfunc, context)

# upfunc: ->
#     console.log('uppppp')
