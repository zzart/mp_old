# Chaplin = require 'chaplin'
Model = require 'models/base/model'
mediator = require 'mediator'

module.exports = class Collection extends Chaplin.Collection
    # Mixin a synchronization state machine
    # _(@prototype).extend Chaplin.SyncMachine
    initialize: ->
        @query= {}
        @query_add(@query_defaults())

        # NOTE: backbone events are triggered on collection as well as on models
        # since events on models can fire multiple times they are unreliable
        # events on collections are more delibered as i've programmed them to
        # reflect the state of server side
        @on('change', @onChange)
        @on('add', @onAdd)
        @on('remove', @onRemove)
        @on('destroy', @onDestory)
        @on('sync', @onSync)

    onSync: ->
        @publishEvent('log:debug',"--> collection #{@module_name()[0]} sync")
    onChange: ->
        @publishEvent('log:debug',"--> collection #{@module_name()[0]} changed")
    onAdd: ->
        @publishEvent('log:debug',"--> collection #{@module_name()[0]} add")
    onDestroy: ->
        @publishEvent('log:debug',"--> collection #{@module_name()[0]} destroyed")
    onRemove: ->
        @publishEvent('log:debug',"--> collection #{@module_name()[0]} remove")

    module_name: ->
        @model.prototype.module_name

    # Use the project base model per default, not Chaplin.Model
    model: Model
    # clone allowes to clone collection, we should use hard copy by default
    # and have shallow copy for other cases
    clone: ->
        new @constructor(_.map(@models, (m)->
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

