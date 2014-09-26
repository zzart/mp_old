mediator = require 'mediator'

module.exports = class Import extends Chaplin.Model
    urlRoot: "#{mediator.server_url}v1/importy"
    schema: {}
    get: (attr) ->
        value = Backbone.Model::get.call(this, attr)
        (if _.isFunction(value) then value.call(this) else value)
    defaults:
        import_status_func: ->
            switch parseInt(@get('import_status'))
                 when 0 then 'Udany'
                 when 1 then 'Nie udany'
        import_type_func: ->
            switch parseInt(@get('import_type'))
                 when 0 then 'Pełny'
                 when 1 then 'Przyrostowy'
        date_func: ->
            @get('date').substr?(0,10)
    toJSON: ->
        data = {}
        json = Backbone.Model::toJSON.call(this)
        _.each(json, (value, key) ->
            data[key] = @get(key)
        , this)
        data

    module_name: ['import', 'importy']
    get_url: ->
        return "<a href=\'/#{@module_name[1]}/#{@get('id')}\'>#{@module_name[0].toUpperCase()} ##{@get('id')}</a>"

    initialize: ->
        @on('change:name', @onChange)
        @on('add', @onAdd)
        @on('remove', @onRemove)
        @on('destroy', @onDestory)

    onChange: ->
        @publishEvent('log:info',"--> #{@module_name[0]} changed")
        # after change in name need to regenerate forms and localStorage
        # all needs to take off with a slight delay so that model has a chance to save itself
        self = @
        _.delay(->
            self.publishEvent('modelchanged', @module_name[0])
        , 30)
    onAdd: ->
        @publishEvent('log:info',"--> #{@module_name[0]} add")
    onDestroy: ->
        @publishEvent('log:info',"--> #{@module_name[0]} destroyed")
        @publishEvent('modelchanged', 'client')
    onRemove: ->
        @publishEvent('log:info',"--> #{@module_name[0]} removed")

