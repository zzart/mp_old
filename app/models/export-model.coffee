mediator = require 'mediator'
module.exports = class Export extends Chaplin.Model
    urlRoot: 'http://localhost:8080/v1/eksporty'
    schema: {}
    get: (attr) ->
        value = Backbone.Model::get.call(this, attr)
        (if _.isFunction(value) then value.call(this) else value)
    defaults:
        is_active: '1' # for booleans
        # opacity: '100' #
        is_active_func: ->
            if @get('is_active')  then 'tak' else 'nie'
        # thumbnail_func: ->
        #     resource = @get('resources')
        #     if not _.isEmpty(resource)
        #         r = resource[0]
        #         if r.mime_type.split('/')[0] is 'image'
        #             img = new Image()
        #             img.src = 'data:' + r.mime_type + ';base64,' + r.thumbnail
        #             img.outerHTML
        branch_func: ->
            if @get('branch') then localStorage.getObject('branches')["#{@get('branch')}"]
        date_created_func: ->
            @get('date_created').substr?(0,10)
        # image_type_func: ->
        #     switch parseInt(@get('image_type'))
        #          when 0 then 'logo'
        #          when 1 then 'znak wodny'
        # position_func: ->
        #     switch parseInt(@get('position'))
        #          when 0 then 'lewy górny'
        #          when 1 then 'prawy górny'
        #          when 2 then 'lewy dolny'
        #          when 3 then 'prawy dolny'
    toJSON: ->
        data = {}
        json = Backbone.Model::toJSON.call(this)
        _.each(json, (value, key) ->
            data[key] = @get(key)
        , this)
        data

    module_name: ['eksport', 'eksporty']
    get_url: ->
        return "<a href=\'/#{@module_name[1]}/#{@get('id')}\'>#{@module_name[0].toUpperCase()} ##{@get('id')}</a>"

    # initialize: ->
    #     @on('change:surname', @onChange)
    #     @on('add', @onAdd)
    #     @on('remove', @onRemove)
    #     @on('destroy', @onDestory)
    # onChange: ->
    #     @publishEvent('modelchanged', 'client')
    # onAdd: ->
    #     console.log('--> model add')
    # onDestroy: ->
    #     @publishEvent('modelchanged', 'client')
    # onRemove: ->
    #     console.log('--> model remove')
