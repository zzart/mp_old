mediator = require 'mediator'
Model = require 'models/base/model'

module.exports = class Client extends Model
    #urlRoot: 'http://localhost:8080/v1/klienci'
    urlRoot: "#{mediator.server_url}v1/klienci"
    schema: {}
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


    update: ->
        # after change in name need to regenerate forms and localStorage
        # all needs to take off with a slight delay so that model has a chance to save itself
        self = @
        _.delay(->
            self.publishEvent('modelchanged', 'client')
            self.publishEvent('refresh_localstorage', 'clients')
        , 30)

    onChange: ->
        super
        @update()
    onAdd: ->
        super
    onDestroy: ->
        super
        @publishEvent('modelchanged', 'client')
    onRemove: ->
        super
        @update()
    module_name: ['klient', 'klienci']
    prefix: {}
    sufix: {}
