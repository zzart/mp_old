#Chaplin = require 'chaplin'
require 'lib/view-helper' # Just load the view helpers, no return value
mediator = require 'mediator'

module.exports = class View extends Chaplin.View
  # Precompiled templates function initializer.
    getTemplateFunction: ->
        @template

    # generic request for making non backbone specyfic requests
    # quering controllers etc.
    mp_request: (model, url, type, msg_success, msg_fail, async=true) ->
        self = @
        $.ajax(
            async: async
            url: url
            beforeSend: (xhr) ->
                xhr.setRequestHeader('X-Auth-Token' , mediator.gen_token(url))
            type: type
            success: (data, textStatus, jqXHR ) =>
                self.publishEvent("tell_user", msg_success)
            error: (jqXHR, textStatus, errorThrown ) ->
                # since we have various response objects
                # NOTE: watch out for defaut msg_fail -- it will obscure real msg from the server
                window.response = jqXHR if mediator.online is false
                if msg_fail
                    self.publishEvent("tell_user", msg_fail)
                    self.publishEvent("log:debug", "msg_fail: #{msg_fail}")
                else if jqXHR.responseJSON?.title?
                    self.publishEvent("tell_user", jqXHR.responseJSON.title)
                    self.publishEvent("log:debug", "responseJSON.title: #{jqXHR.responseJSON.title}")
                else if jqXHR.responseText?
                    self.publishEvent("tell_user", jqXHR.responseText)
                    self.publishEvent("log:debug", "responseText: #{jqXHR.responseText}")
                else
                    self.publishEvent("tell_user", errorThrown)
                    self.publishEvent("log:debug", "errorThrown: #{errorThrown}")
        )


    add_jump_option: (id) =>
        # given selector id add empty option
        el = $("select[id$='_#{id}']")
        el.prepend("<option value=''>-- dodaj nowy --</option>")

    get_errors: (errors) ->
        # strip HTML tags
        pattern = /<(?:.|\n)*?>/gm
        # given model validation errors return nicely formated missing fields
        schema = @model.get_schema()
        arr = []
        for key, val of errors
            arr.push(schema[key].title.replace(pattern, ''))
        return arr.toString()

    get_image: ->
        "data:image/png;base64,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"
