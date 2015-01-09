# Chaplin = require 'chaplin'
# mediator = require 'mediator'

module.exports = class Model extends Chaplin.Model
    # Mixin a synchronization state machine
    # _(@prototype).extend Chaplin.SyncMachine
    initialize: ->
        @on('change', @onChange)
        @on('add', @onAdd)
        @on('remove', @onRemove)
        @on('destroy', @onDestory)

    onChange: ->
        @publishEvent('log:info',"--> #{@module_name[0]} changed")
    onAdd: ->
        @publishEvent('log:info',"--> #{@module_name[0]} add")
    onDestroy: ->
        @publishEvent('log:info',"--> #{@module_name[0]} destroyed")
    onRemove: ->
        @publishEvent('log:info',"--> #{@module_name[0]} remove")

    update: ->
        # after change in name need to regenerate forms and localStorage
        # all needs to take off with a slight delay so that model has a chance to save itself
        self = @
        _.delay(->
            self.publishEvent('modelchanged', 'client')
        , 30)

    get: (attr) ->
        value = Backbone.Model::get.call(this, attr)
        (if _.isFunction(value) then value.call(this) else value)
    toJSON: ->
        data = {}
        json = Backbone.Model::toJSON.call(this)
        _.each(json, (value, key) ->
            data[key] = @get(key)
        , this)
        data
    get_name: ->
        @get('name')
    get_url: ->
        return "<a href=\'/#{@module_name[1]}/#{@get('id')}\'>#{@module_name[0].toUpperCase()} ##{@get('id')}</a>"

    clone: ->
        new this.constructor(_.map(this.model, (m)->
                m.clone()
        ))
    clone_shallow: ->
        Backbone.Model.prototype.clone()
