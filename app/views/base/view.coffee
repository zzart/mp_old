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
                self.publishEvent("tell_user", msg_fail or jqXHR.responseText or errorThrown)
        )
