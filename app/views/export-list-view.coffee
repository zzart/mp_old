View = require 'views/list-view'
mediator = require 'mediator'

module.exports = class ExportListView extends View
    initialize: (params) ->
        super
        @delegate 'click', "#select_all_for_export", @select_all_for_export
        @delegate 'click', "#delete_all_for_export", @delete_all_for_export
        @module_name = 'ExportListView'

    select_all_for_export: (e) =>
        @publishEvent('log:info', "#{@module_name} select_all_for_export id:#{e.target.id} data:#{e.target.dataset.export}")
        @make_ajax_request(e, 'zaznacz', 'POST')
        e.preventDefault()

    delete_all_for_export: (e) =>
        @publishEvent('log:info', "#{@module_name} delete_all_for_export id:#{e.target.id} data:#{e.target.dataset.export}")
        e.preventDefault()
        @make_ajax_request(e, 'usun', 'POST')

    make_ajax_request: (e, action, request_type) =>
        @model = @collection_hard.get(e.target.dataset.export)
        url = "#{@model.urlRoot}/#{e.target.dataset.export}/#{action}"
        self = @
        $.ajax(
            url: url
            beforeSend: (xhr) ->
                xhr.setRequestHeader('X-Auth-Token' , mediator.gen_token(url))
            type: request_type
            success: (data, textStatus, jqXHR ) =>
                self.publishEvent("tell_user", 'Wszystkie oferty spełnające kryteria eksportu zostały zaznaczone/usunięte')
            error: (jqXHR, textStatus, errorThrown ) ->
                self.publishEvent("tell_user", jqXHR.responseJSON.title or errorThrown)
        )

    attach: =>
        super
        @publishEvent('log:info', "#{@module_name} afterRender()")

