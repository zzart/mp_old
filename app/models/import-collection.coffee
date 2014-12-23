Model = require 'models/import-model'
Collection = require 'models/base/collection'
mediator = require 'mediator'

module.exports = class ImportList extends Collection
    model: Model
    #url: 'http://localhost:8080/v1/eksporty'
    url: "#{mediator.server_url}v1/importy"
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

