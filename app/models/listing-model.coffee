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

        date_created_func: ->
            @get('date_created').substr?(0,10)
        date_modyfied_func: ->
            @get('date_modyfied').substr?(0,10)
        waluta_func: ->
            localStorage.getObject('choices')["#{@get('waluta')}"]
        agent_func: ->
            localStorage.getObject('agents')["#{@get('agent')}"]
        client_func: ->
            localStorage.getObject('clients')["#{@get('client')}"]
        rynek_func: ->
            localStorage.getObject('choices')["#{@get('rynek')}"]
        wylacznosc_func: ->
            if @get('wylacznosc') then 'tak' else 'nie'

        status_func: ->
            switch @get('status')
                 when 0 then 'nieaktywna'
                 when 1 then 'aktywna'
                 when 2 then 'archiwalna'
                 when 3 then 'robocza'
                 when 4 then 'sprzedana'
                 when 5 then 'wynajęta'
                 when 6 then 'umowa przedwstępna'

    toJSON: ->
        data = {}
        json = Backbone.Model::toJSON.call(this)
        _.each(json, (value, key) ->
            data[key] = @get(key)
        , this)
        data

    module_name: ['oferta', 'oferty']
    get_url: ->
        return "<a href=\'/#{@module_name[1]}/#{@get('id')}\'>#{@module_name[0].toUpperCase()} ##{@get('id')}</a>"

    initialize: ->
        @on('change:agent', @onChangeAgent)
        @on('add', @onAdd)
        @on('remove', @onRemove)
        @on('destroy', @onDestory)
    onChangeAgent: (model, attribute) ->
        console.log('--> model changed', model, attribute)
        model.save()
        #onAdd: ->
        #    console.log('--> model add')
        #onDestroy: ->
        #    console.log('--> model destroy')
        #onRemove: ->
        #    console.log('--> model remove')
        #module_name: ['klient', 'klienci']


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
