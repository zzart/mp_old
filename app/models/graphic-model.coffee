mediator = require 'mediator'
module.exports = class Graphic extends Chaplin.Model
    urlRoot: 'http://localhost:8080/v1/grafiki'
    schema: {}
    get: (attr) ->
        value = Backbone.Model::get.call(this, attr)
        (if _.isFunction(value) then value.call(this) else value)
    defaults:
        is_active: '1' # for booleans
        opacity: 20 #
        is_active_func: ->
            if @get('is_active') then 'tak' else 'nie'
    #     is_private: '' # for booleans
    #     client_type_func: ->
    #         switch @get('client_type')
    #              when 1 then 'kupujący'
    #              when 2 then 'sprzedający'
    #              when 3 then 'wynajmujący'
    #              when 4 then 'najemca'
    toJSON: ->
        data = {}
        json = Backbone.Model::toJSON.call(this)
        _.each(json, (value, key) ->
            data[key] = @get(key)
        , this)
        data

    # initialize: ->
    #     @on('change:surname', @onChange)
    #     @on('add', @onAdd)
    #     @on('remove', @onRemove)
    #     @on('destroy', @onDestory)
    # onChange: ->
    #     @publishEvent('modelchanged', 'client')
    # onAdd: ->
    #     console.log('--> model add')
    # onDestroy: ->
    #     @publishEvent('modelchanged', 'client')
    # onRemove: ->
    #     console.log('--> model remove')
