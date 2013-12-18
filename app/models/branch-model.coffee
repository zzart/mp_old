mediator = require 'mediator'
module.exports = class Branch extends Chaplin.Model
    urlRoot: 'http://localhost:8080/v1/oddzialy'
    schema: {}
    get: (attr) ->
        value = Backbone.Model::get.call(this, attr)
        (if _.isFunction(value) then value.call(this) else value)
    defaults:
        is_main_func: ->
            if @get('is_main') then 'tak' else 'nie'
    toJSON: ->
        data = {}
        json = Backbone.Model::toJSON.call(this)
        _.each(json, (value, key) ->
            data[key] = @get(key)
        , this)
        data
