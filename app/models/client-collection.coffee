Model = require 'models/client-model'
mediator = require 'mediator'

module.exports = class ClientList extends Chaplin.Collection
    model: Model
    #url: 'http://localhost:8080/v1/klienci'
    url: "#{mediator.server_url}v1/klienci"
    #initialize: ->
    #    @on('change', @onChange)
    #    @on('add', @onAdd)
    #    @on('remove', @onRemove)
    #    @on('destroy', @onDestory)
    #onChange: ->
    #    console.log('--> collection changed')
    #onAdd: ->
    #    console.log('--> collection add')
    #onDestroy: ->
    #    console.log('--> collection destroyed')
    #onRemove: ->
    #    console.log('--> collection remove')

