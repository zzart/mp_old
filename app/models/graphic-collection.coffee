Model = require 'models/graphic-model'
mediator = require 'mediator'

module.exports = class GraphicList extends Chaplin.Collection
    model: Model
    #url: 'http://localhost:8080/v1/grafiki'
    url: "#{mediator.server_url}v1/grafiki"
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

