mediator = require 'mediator'
Model = require 'models/base/model'

module.exports = class Listing extends Model
    #urlRoot: 'http://localhost:8080/v1/oferty'
    urlRoot: "#{mediator.server_url}v1/oferty"
    schema: {}
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
                    img.width = 90
                    img.outerHTML
            else
                img = new Image()
                img.src = 'images/ikona.png'
                img.width = 90
                img.outerHTML


        date_created_func: ->
            @get('date_created').substr?(0,10)
        date_modified_func: ->
            @get('date_modified').substr?(0,10)
        date_updated_func: ->
            @get('date_updated').substr?(0,10)
        waluta_func: ->
            localStorage.getObject('choices')["#{@get('waluta')}"]
        agent_func: ->
            localStorage.getObjectNames('agents')["#{@get('agent')}"]
        client_func: ->
            localStorage.getObjectNames('clients')["#{@get('client')}"]
        rynek_func: ->
            localStorage.getObject('choices')["#{@get('rynek')}"]
        wylacznosc_func: ->
            if @get('wylacznosc') then 'tak' else 'nie'
        category_func: ->
            localStorage.getObject('categories_full')["#{@get('category')}"]


        status_func: ->
            switch @get('status')
                 when 0 then 'nieaktywna'
                 when 1 then 'aktywna'
                 when 2 then 'archiwalna'
                 when 3 then 'robocza'
                 when 4 then 'sprzedana'
                 when 5 then 'wynajęta'
                 when 6 then 'umowa przedwstępna'
                 when 7 then 'usunięta'

        # TODO: somehow we can't reference status_func
        # if we do then slugify() loses context ...
        # anyway, do this better if boared
        status_func_slug: ->
            status = switch @get('status')
                 when 0 then 'nieaktywna'
                 when 1 then 'aktywna'
                 when 2 then 'archiwalna'
                 when 3 then 'robocza'
                 when 4 then 'sprzedana'
                 when 5 then 'wynajęta'
                 when 6 then 'umowa przedwstępna'
                 when 7 then 'usunięta'
            Model.prototype.slugify(status or '')


    module_name: ['oferta', 'oferty', 'listing', 'listings']
    author: 'agent'
    branch_edit_allowed: true

    get_category: ->
        _.invert(localStorage.getObject('categories'))[@.get('category')]

    get_schema: ->
        # override base schema so we can have categories
        @publishEvent('log:debug', "#{@module_name[2]} get_schema called")
        localStorage.getObject("#{@get_category()}_schema")

    clear_interval: ->
        clearInterval(@interval)

    get_form_name: ->
        # override base schema so we can have categories
        "#{@get_category()}_form"

    get_form: ->
        # override base schema so we can have categories
        @publishEvent('log:debug', "#{@module_name[2]} get_form called")
        localStorage.getObject("#{@get_category()}_form")

    # TODO: let's do it when I get some time
    # changing tabs causing weird appending stuff ...
    # prefix: {}
    # sufix: {
    #     'powierzchnia_calkowita': 'm2'
    #     'powierzchnia_lazienek': 'm2'
    #     'powierzchnia_wc': 'm2'
    #     'powierzchnia_kuchni': 'm2'
    #     'powierzchnia_piwnicy': 'm2'
    #     'powierzchnia_uzytkowa': 'm2'
    #     'powierzchnia_balkonu': 'm2'
    #     'powierzchnia_biurowa': 'm2'
    # }

    initialize: ->
        super
        @on('change:agent', @onChangeAgent)
        # @on('add', @onAdd)
        # @on('remove', @onRemove)
        # @on('destroy', @onDestory)
    onChangeAgent: (model, attribute) ->
        # for changing Agent from dropdown list page
        # NOTE: we want to trigger this only for already existing models which have agent set
        # otherwise trigger fires each time new models is created
        if not _.isUndefined(model.previous('agent'))
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
