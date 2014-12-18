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
