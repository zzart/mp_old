mediator = require 'mediator'
Model = require 'models/base/model'

module.exports = class Import extends Model
    urlRoot: "#{mediator.server_url}v1/importy"
    schema: {}
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

    module_name: ['import', 'importy']

    onChange: ->
        super
        # @publishEvent('log:info',"--> #{@module_name[0]} changed")
        # after change in name need to regenerate forms and localStorage
        # all needs to take off with a slight delay so that model has a chance to save itself
        self = @
        _.delay(->
            self.publishEvent('modelchanged', @module_name[0])
        , 30)
    onAdd: ->
        super
        @publishEvent('log:info',"--> #{@module_name[0]} add")
    onDestroy: ->
        super
        # @publishEvent('log:info',"--> #{@module_name[0]} destroyed")
        @publishEvent('modelchanged', 'client')
    onRemove: ->
        super
        @publishEvent('log:info',"--> #{@module_name[0]} removed")

