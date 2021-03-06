mediator = require 'mediator'
Model = require 'models/base/model'

module.exports = class Client extends Model
    #urlRoot: 'http://localhost:8080/v1/klienci'
    urlRoot: "#{mediator.server_url}v1/klienci"
    schema: {}
    defaults:
        thumbnail_func: ->
                img = new Image()
                img.src = 'images/untick.png'
                img.width = 16
                img.className = 'ui-li-icon'
                img.outerHTML

        is_private: '' # for booleans
        client_type_func: ->
            switch @get('client_type')
                 when 1 then 'kupujący'
                 when 2 then 'sprzedający'
                 when 3 then 'wynajmujący'
                 when 4 then 'najemca'

        client_type_func_slug: ->
            type = switch @get('client_type')
                 when 1 then 'kupujący'
                 when 2 then 'sprzedający'
                 when 3 then 'wynajmujący'
                 when 4 then 'najemca'
            Model::slugify(type or '')

        agent_func: ->
            localStorage.getObjectNames('agents')["#{@get('agent')}"]

    initialize: ->
        super
        @on('change:name', @onChange)

    onChange: ->
        super
        @publishEvent('localstorage:refresh', 'clients')

    onDestroy: ->
        super
        @publishEvent('localstorage:refresh', 'clients')

    onRemove: ->
        super
        @publishEvent('localstorage:refresh', 'clients')

    author: 'agent'
    branch_edit_allowed: true
    module_name: ['klient', 'klienci', 'client', 'clients']
    prefix: {}
    sufix: {}
