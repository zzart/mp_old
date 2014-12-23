Model = require 'models/export-model'
Collection = require 'models/base/collection'
mediator = require 'mediator'

module.exports = class ExportList extends Collection
    model: Model
    #url: 'http://localhost:8080/v1/eksporty'
    url: "#{mediator.server_url}v1/eksporty"
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

