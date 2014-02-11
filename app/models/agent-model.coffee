mediator = require 'mediator'
module.exports = class Agent extends Chaplin.Model
    urlRoot: 'http://localhost:8080/v1/agenci'
    schema: {}
    get: (attr) ->
        value = Backbone.Model::get.call(this, attr)
        (if _.isFunction(value) then value.call(this) else value)
    defaults:
        is_active: '1' # for booleans
        is_active_func: ->
            if @get('is_active') then 'tak' else 'nie'
        is_admin_func: ->
            if @get('is_admin') then 'tak' else 'nie'
        agent_type_func: ->
            switch @get('agent_type')
                 when 0 then 'pośrednik'
                 when 1 then 'admin. nieruch.'
                 when 2 then 'menadzer'
                 when 3 then 'IT'
        branch_func: ->
            if @get('branch') then localStorage.getObject('branches')["#{@get('branch')}"]

    toJSON: ->
        data = {}
        json = Backbone.Model::toJSON.call(this)
        _.each(json, (value, key) ->
            data[key] = @get(key)
        , this)
        data
