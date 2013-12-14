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
        header_string = "#{mediator.app},#{apphash_hexed},#{@user},#{userhash_hexed}"
        auth_header = btoa(header_string)
        # -------------------------
        @model.fetch
            headers: {'X-Auth-Token' : auth_header}
            success: =>
                @publishEvent('log:info', 'login SUCCESS')
                @model.set({is_logged:true})
                @model.set({user_pass:@pass})
                localStorage.clear() #clear old rubbish
                localStorage.setObject('schemas', @model.get('schemas'))
                $('#first-name-placeholder').text(@model.get('first_name'))
                $('#bon-config-link').attr('href', "/biura/#{@model.get('company_id')}")
                $('#agent-config-link').attr('href', "/agenci/#{@model.get('id')}")
                $('#login').popup('close')
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



