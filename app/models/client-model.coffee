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

    initialize: ->
        super
        @on('change:name', @onChange)

    onChange: ->
        super
        @update()

    onDestroy: ->
        super
        @publishEvent('modelchanged', 'client')

    onRemove: ->
        super
        @update()

    module_name: ['klient', 'klienci']
    prefix: {}
    sufix: {}
