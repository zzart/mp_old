Model = require 'models/client-model'
mediator = require 'mediator'
Collection = require 'models/base/collection'

module.exports = class ClientList extends Collection
    model: Model
    url: "#{mediator.server_url}v1/klienci"

    query_defaults: ->
        # query without status which differes from base-collection
        branch: mediator.models.user.get('branch_id')
        agent: mediator.models.user.get('id')

    comparator: (item) ->
            item.get('surname')
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

