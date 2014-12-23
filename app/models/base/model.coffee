# Chaplin = require 'chaplin'
# mediator = require 'mediator'

module.exports = class Model extends Chaplin.Model
    # Mixin a synchronization state machine
    # _(@prototype).extend Chaplin.SyncMachine
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
