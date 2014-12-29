# Chaplin = require 'chaplin'
Model = require 'models/base/model'

module.exports = class Collection extends Chaplin.Collection
    # Mixin a synchronization state machine
    # _(@prototype).extend Chaplin.SyncMachine

    # Use the project base model per default, not Chaplin.Model
    model: Model
    clone: ->
        new this.constructor(_.map(this.models, (m)->
                m.clone()
        ))
    clone_shallow: ->
        Backbone.Collection.prototype.clone()
