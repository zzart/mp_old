mediator = require 'mediator'
module.exports = class Client extends Chaplin.Model
    urlRoot: 'http://localhost:8080/v1/klienci'
    schema: {}
    get: (attr) ->
        value = Backbone.Model::get.call(this, attr)
        (if _.isFunction(value) then value.call(this) else value)
    defaults:
        is_private: '' # for booleans
        client_type_func: ->
            switch @get('client_type')
                 when 1 then 'kupujący'
                 when 2 then 'sprzedający'
                 when 3 then 'wynajmujący'
                 when 4 then 'najemca'
    toJSON: ->
        data = {}
        json = Backbone.Model::toJSON.call(this)
        _.each(json, (value, key) ->
            data[key] = @get(key)
        , this)
        data

