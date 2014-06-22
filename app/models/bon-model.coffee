mediator = require 'mediator'

module.exports = class Bon extends Chaplin.Model
    urlRoot: "#{mediator.server_url}v1/biura"
    schema: {}
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
    # defaults:
    #     is_private: '' # for booleans
    module_name: ['biuro', 'biura']
    get_url: ->
        return "<a href=\'/#{@module_name[1]}/#{@get('id')}\'>#{@module_name[0].toUpperCase()} ##{@get('id')}</a>"
