StructureController = require 'controllers/structure-controller'
mediator = require 'mediator'

# this is secure controller which all secure controllers need to extend from
# what it does : if user isn't logged_in redirects to login route
module.exports = class AuthController extends StructureController
    beforeAction: (params, route) ->
        super # call StructureController beforeAction
        @publishEvent('log:debug', 'AuthController start ----------#beforeAction()')
        if mediator.online is false
            @publishEvent('log:debug',  window.location.pathname)
            @publishEvent('log:debug',  mediator.models.user?.toJSON())
        # @publishEvent('tell_user', 'Pracuje ...')

        if _.isEmpty(mediator.models.user)
            mediator.redirectUrl = window.location.pathname
            @redirectTo {url: 'login'}
        @publishEvent('log:debug', 'AuthController done ----------')



#AUTH -----------------------------------------------------------------------
# gen_token = ( model, url, password) =>
#     # console.log('url: ' , url)
#     apphash = CryptoJS.HmacSHA256(url, mediator.app_key)
#     apphash_hexed = apphash.toString(CryptoJS.enc.Hex)
#     userhash = CryptoJS.HmacSHA256(url, mediator.models.user.get('user_pass'))
#     userhash_hexed = userhash.toString(CryptoJS.enc.Hex)
#     header_string = "#{mediator.app},#{apphash_hexed},#{mediator.models.user.get('username')}@#{mediator.models.user.get('company_name')},#{userhash_hexed}"
#     auth_header = btoa(header_string)

_sync = Backbone.sync
Backbone.sync = (method, model, options) ->
    console.log('mediator: ',  Chaplin.mediator )
    console.log('model: ',  model)
    console.log('method: ',  method)
    console.log('options: ',  options )
    console.log('options data: ',  options.data )
    console.log('is new?:',  model.isNew?())
    $.mobile.loading('show')
    self = @
    #$.mobile.loading('show')
    # -------- let's find general hook event for recieving request
    # lets do this once logged in
    if Chaplin.mediator.models.user?.get('is_logged')
        # check if we have a collection wirh url or model with urlRoot
        if model.urlRoot
            #check if urlRoot is a function !
            if _.isFunction(model.urlRoot)
                clean_url = model.urlRoot()
            else
                clean_url = model.urlRoot

            if model.isNew()
                url = clean_url
            else
                url = "#{clean_url}/#{model.id}"
        else
            url = model.url
        if not _.isEmpty(options.data)
            # if we have parameters in query include them in url
            params = $.param(options.data)
            url = "#{url}?#{params}"
        # console.log( url )
        # hash = gen_token(model, url , Chaplin.mediator.models.user.get('user_pass'))
        hash = Chaplin.mediator.gen_token(url)
        options.beforeSend = (xhr) ->
            xhr.setRequestHeader('X-Auth-Token' , hash)
        # console.log('header set',hash, method, model, options)
        # console.log(method, options, model)

    #calling the original sync funtion so we only overriding what we need
    request = _sync.call(this, method, model, options)
    request.done((msg) ->
        $.mobile.loading('hide')
        # let's save this to localStorage
        # model in this case could mean model or collection
        if method is 'read'
            if(!!model.models) # check if we have collection
                localStorage.setObject("#{model.model.prototype.module_name[2]}_data", model.models)
    )
    request.fail((jqXHR, textStatus) ->
        self.publishEvent('log:debug', "#{jqXHR.jqXHR}, #{textStatus}")
        $.mobile.loading('hide')
        msg = if textStatus != 'error' then textStatus else ''
        if _.isObject(jqXHR)
            # lets check if we have responseText or responseJSON
            if jqXHR.responseText?.title or jqXHR.responseJSON?.title?
                self.publishEvent('tell_user', "#{jqXHR.responseJSON.title or jqXHR.responseText.title} #{msg}")
            else
                self.publishEvent('tell_user', "#{JSON.stringify(jqXHR)} #{msg}")
        else
            self.publishEvent('tell_user', "#{jqXHR} #{msg}")
    )
#AUTH -----------------------------------------------------------------------
