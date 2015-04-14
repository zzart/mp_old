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
        @on 'addedToDOM', @open_dialog

    open_dialog: =>
        @publishEvent('log:info', 'opening login popup')
        $ ->
            $('#page').enhanceWithin()
            $('#login').popup('open')
            $("input#user").focus()
            # set cookie if exists
            if $.cookie('user')
                $('input#user').val($.cookie('user'))
            if $.cookie('pass')
                $('input#pass').val($.cookie('pass'))

    login:(event) =>
        event.preventDefault()
        #check credentials and set up settings
        @publishEvent('log:info', 'login attempt')
        #get data from form
        @user = $('input#user').val()
        @pass = $('input#pass').val()
        # -------------------------
        # generate app mac
        apphash = CryptoJS.HmacSHA256(@model.url, mediator.app_key)
        apphash_hexed = apphash.toString(CryptoJS.enc.Hex)
        userhash = CryptoJS.HmacSHA256(@model.url, @pass)
        userhash_hexed = userhash.toString(CryptoJS.enc.Hex)
        header_string = "#{mediator.app}|#{apphash_hexed}|#{@user}|#{userhash_hexed}"
        auth_header = btoa(header_string)
        # -------------------------
        @model.fetch
            headers: {'X-Auth-Token' : auth_header}
            success: =>
                @publishEvent('log:info', 'login SUCCESS')
                @model.set({'user_pass':@pass}) # set this manually so we don't send password back and forth
                @model.set({'company_name':@user.split('@')[1]}) #
                @model.update_db()
                $.cookie('user', @user, {expires: 7})
                $.cookie('pass', @pass, {expires: 7})
                $('#first-name-placeholder').text(@model.get('first_name') or @model.get('username'))
                $('#bon-config-link').attr('href', "/biura/#{@model.get('company_id')}")
                $('#agent-config-link').attr('href', "/agenci/#{@model.get('id')}")
                $('#login').popup('close')
                @publishEvent 'login:success' #loads additional scripts
                @publishEvent 'tell_user', "Logowanie zakończone."
                Chaplin.utils.redirectTo {url: ''}
            error:(model, response, options) =>
                if response.responseJSON?
                    $('.login-error').text(response.responseJSON['title'])
                else
                    $('.login-error').text('Brak kontaktu z serwerem')
                @publishEvent('log:info', 'login FAILED')

    attach: =>
        @publishEvent('log:info', 'view: login afterRender()')
        super



