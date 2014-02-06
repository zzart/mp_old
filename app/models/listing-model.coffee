module.exports = class Listing extends Chaplin.Model
    urlRoot: 'http://localhost:8080/v1/oferty'
    schema: {}
    get: (attr) ->
        value = Backbone.Model::get.call(this, attr)
        (if _.isFunction(value) then value.call(this) else value)
    defaults:
        # is_active: '1' # for booleans
        # is_active_func: ->
        #     if @get('is_active') then 'tak' else 'nie'
        thumbnail_func: ->
            resource = @get('resources')
            if not _.isEmpty(resource)
                r = resource[0]
                if r.mime_type.split('/')[0] is 'image'
                    img = new Image()
                    img.src = 'data:' + r.mime_type + ';base64,' + r.thumbnail
                    img.outerHTML

    toJSON: ->
        data = {}
        json = Backbone.Model::toJSON.call(this)
        _.each(json, (value, key) ->
            data[key] = @get(key)
        , this)
        data
        # agent_type_func: ->
        #     switch @get('agent_type')
        #          when 0 then 'pośrednik'
        #          when 1 then 'admin'
        #          when 2 then 'menadzer'
        #          when 3 then 'IT'
    # file_to_string: ->
    #     'test function'

    # readFile: (file) ->
    #     reader = new FileReader()
    #     self = @
    #     # closure to capture the file information.
    #     reader.onload = ((theFile, self) ->
    #         (e) ->
    #             #set model
    #             self.set
    #                 filename: theFile.name
    #                 data: e.target.result
    #     )(file, @)
    #     # Read in the image file as a data URL.
    #     reader.readAsDataURL file
