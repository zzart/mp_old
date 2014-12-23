mediator = require 'mediator'
Model = require 'models/base/model'

module.exports = class Graphic extends Model
    urlRoot: "#{mediator.server_url}v1/grafiki"
    schema: {}
    defaults:
        is_active: '1' # for booleans
        opacity: '100' #
        is_active_func: ->
            if @get('is_active') then 'tak' else 'nie'
        thumbnail_func: ->
            resource = @get('resources')
            if not _.isEmpty(resource)
                r = resource[0]
                if r.mime_type.split('/')[0] is 'image'
                    img = new Image()
                    img.src = 'data:' + r.mime_type + ';base64,' + r.thumbnail
                    img.outerHTML
        branch_func: ->
            if @get('branch') then localStorage.getObject('branches')["#{@get('branch')}"]
        image_type_func: ->
            switch parseInt(@get('image_type'))
                 when 0 then 'logo'
                 when 1 then 'znak wodny'
        position_func: ->
            switch parseInt(@get('position'))
                 when 0 then 'lewy górny'
                 when 1 then 'prawy górny'
                 when 2 then 'lewy dolny'
                 when 3 then 'prawy dolny'

    module_name: ['grafika', 'grafiki']

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
