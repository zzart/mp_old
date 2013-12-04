View = require 'views/base/view'
template = require 'views/templates/login'
mediator = require 'mediator'
module.exports = class LoginView extends View
    autoRender: true
    template: template
    id: 'login'
    attributes: {'data-role':'popup', 'data-overlay-theme':'b', 'data-theme':'b', 'data-dismissible':'false' , 'style':'max-width:400px;'}
    initialize: (options) =>
        super
        @model = mediator.models.user
        @template = template
        # events
        @delegate 'click','#login-verification', @login
        @on 'addedToDOM', @login


    login: =>
        @publishEvent('log:error', 'autologin------')
        #check credentials and set up settings
        #get data from form
        @user = 'zzart'
        @pass = 'maddog'
        # -------------------------
        # generate app mac
        apphash = CryptoJS.HmacSHA256(@model.url, mediator.app_key)
        apphash_hexed = apphash.toString(CryptoJS.enc.Hex)
        userhash = CryptoJS.HmacSHA256(@model.url, @pass)
        userhash_hexed = userhash.toString(CryptoJS.enc.Hex)
        header_string = "#{mediator.app},#{apphash_hexed},#{@user},#{userhash_hexed}"
        auth_header = btoa(header_string)
        # -------------------------
        @model.fetch
            headers: {'X-Auth-Token' : auth_header}
            success: =>
                @publishEvent('log:info', 'login SUCCESS')
                @model.set({is_logged:true})
                @model.set({user_pass:@pass})
                $('#first-name-placeholder').text(@model.get('first_name'))
                Chaplin.helpers.redirectTo {url: ''}
            error: =>
                @publishEvent('log:info', 'login FAILED')

    attach: =>
        super
        @publishEvent('log:info', 'view: login afterRender()')



