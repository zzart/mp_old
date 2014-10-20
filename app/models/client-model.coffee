mediator = require 'mediator'

module.exports = class Client extends Chaplin.Model
    #urlRoot: 'http://localhost:8080/v1/klienci'
    urlRoot: "#{mediator.server_url}v1/klienci"
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
        agent_func: ->
            localStorage.getObject('agents')["#{@get('agent')}"]

    toJSON: ->
        data = {}
        json = Backbone.Model::toJSON.call(this)
        _.each(json, (value, key) ->
            data[key] = @get(key)
        , this)
        data

    initialize: ->
        @on('change:surname', @onChange)
        @on('add', @onAdd)
        @on('remove', @onRemove)
        @on('destroy', @onDestory)


    update: ->
        # after change in name need to regenerate forms and localStorage
        # all needs to take off with a slight delay so that model has a chance to save itself
        self = @
        _.delay(->
            self.publishEvent('modelchanged', 'client')
            self.publishEvent('refresh_localstorage', 'clients')
        , 30)

    onChange: ->
        @publishEvent('log:info',"--> #{@module_name[0]} changed")
        @update()
    onAdd: ->
        @publishEvent('log:info',"--> #{@module_name[0]} add")
    onDestroy: ->
        @publishEvent('log:info',"--> #{@module_name[0]} destroyed")
        @publishEvent('modelchanged', 'client')
    onRemove: ->
        @publishEvent('log:info',"--> #{@module_name[0]} removed")
        @update()
    module_name: ['klient', 'klienci']
    get_url: ->
        return "<a href=\'/#{@module_name[1]}/#{@get('id')}\'>#{@module_name[0].toUpperCase()} ##{@get('id')}</a>"

