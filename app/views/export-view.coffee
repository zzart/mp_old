View = require 'views/edit-view'
mediator = require 'mediator'
module.exports = class ExportView extends View
    initialize: (options) =>
        super
        # @upload_multiple = false
        # send url data from controler
        @delegate 'change', "#export_select", @set_export

    set_export: (e) =>
        @publishEvent('log:info', "set_export called with #{e.target.value}")
        portals = localStorage.getObject('portals')
        portal = portals[e.target.value]
        if portal
            $("[name='name']").val(portal['name'])
            $("[name='address_ftp']").val(portal['address_ftp'])
            $("[name='login']").val(portal['login'])
            $("[name='password']").val(portal['password'])
            $("[name='folder_ftp']").val(portal['folder_ftp'])
            $("[name='code_offline']").val(portal['code_offline'])
            input = $("[name='format_type'] input")[portal['format_type']]
            # uncheck all radio
            for i in $("[name='format_type'] input")
                $(i).prop("checked", false).checkboxradio( "refresh" )
                # $(input).checkboxradio() # zero checkboxes
            $(input).prop("checked", true).checkboxradio( "refresh" )
            # @publishEvent('log:info', "#{input}")
            # @publishEvent 'jqm_refersh:render'
            # $("[name='format_type']").checkboxradio()

    save_action: (url) =>
        super
        @publishEvent('log:info','commmit form')
        #run model and schema validation
        if _.isUndefined(@form.commit({validate:true}))
            @model.save({},{
                success:(event) =>
                    if mediator.collections.exports?
                        # add it to collection so we don't need to use server ...
                        mediator.collections.exports.add(@model)
                    @publishEvent 'tell_user', "Rekord #{@model.get_url()} zapisany"
                    Chaplin.utils.redirectTo {url: url ? '/eksporty'}
                error:(model, response, options) =>
                    if response.responseJSON?
                        Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                    else
                        Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'
            })
        else
            @publishEvent 'tell_user', 'Błąd w formularzu! Pola zaznaczone pogrubioną czcionką należy wypełnić.'

    refresh_form: =>
        Chaplin.utils.redirectTo {url: '/eksporty/dodaj'}

    delete_action: =>
        super
        @model.destroy
            success: (event) =>
                mediator.collections.exports.remove(@model)
                @publishEvent 'tell_user', "Rekord został usunięty"
                Chaplin.utils.redirectTo {url: '/eksporty'}
            error:(model, response, options) =>
                if response.responseJSON?
                    Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                else
                    Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'

    attach: =>
        super
        @publishEvent('log:info', 'view: export afterRender()')
        # so list items (resources) can be refreshed on time
        # _.delay(@refresh_resource,10)


