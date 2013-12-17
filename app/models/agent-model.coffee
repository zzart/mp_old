mediator = require 'mediator'
module.exports = class Agent extends Chaplin.Model
    urlRoot: 'http://localhost:8080/v1/agenci'
    schema: {}
    get: (attr) ->
        value = Backbone.Model::get.call(this, attr)
        (if _.isFunction(value) then value.call(this) else value)
    defaults:
        is_active: '1' # for booleans
        is_active_bool: ->
            if @get('is_active') then 'tak' else 'nie'
        is_admin_bool: ->
            if @get('is_admin') then 'tak' else 'nie'

    toJSON: ->
        data = {}
        json = Backbone.Model::toJSON.call(this)
        _.each(json, (value, key) ->
            data[key] = @get(key)
        , this)
        data
