Model = require 'models/listing-model'
mediator = require 'mediator'

module.exports = class ListingList extends Chaplin.Collection
    initialize: ->
        @query= {}
        @query_add(@query_defaults())

    model: Model
    url: 'http://localhost:8080/v1/oferty'

    query_defaults: ->
        branch: mediator.models.user.get('branch_id')
        agent: mediator.models.user.get('id')
        status: 1

    query_add:(new_obj) ->
        _.extend(@query, new_obj)

    query_remove:(key) ->
        @query = _.omit(@query, key)

