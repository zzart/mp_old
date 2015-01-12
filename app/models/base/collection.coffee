# Chaplin = require 'chaplin'
Model = require 'models/base/model'

module.exports = class Collection extends Chaplin.Collection
    # Mixin a synchronization state machine
    # _(@prototype).extend Chaplin.SyncMachine
    initialize: ->
        @query= {}
        @query_add(@query_defaults())


    # Use the project base model per default, not Chaplin.Model
    model: Model
    # clone allowes to clone collection, we should use hard copy by default
    # and have shallow copy for other cases
    clone: ->
        new this.constructor(_.map(this.models, (m)->
                m.clone()
        ))
    clone_shallow: ->
        Backbone.Collection.prototype.clone()

    query_defaults: ->
        branch: mediator.models.user.get('branch_id')
        agent: mediator.models.user.get('id')
        status: 1

    query_add:(new_obj) ->
        _.extend(@query, new_obj)

    query_remove:(key) ->
        @query = _.omit(@query, key)

