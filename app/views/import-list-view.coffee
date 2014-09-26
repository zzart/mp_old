View = require 'views/list-view'
mediator = require 'mediator'

module.exports = class ImportListView extends View
    initialize: (params) ->
        super
        @delegate 'click', "#set_full_export", @set_full_export
        @delegate 'click', "#select_all_for_export", @select_all_for_export
        @delegate 'click', "#delete_all_for_export", @delete_all_for_export
        @module_name = 'ImportListView'

    set_full_export: (e) =>
        e.preventDefault()
        @model = @collection_hard.get(e.target.dataset.export)
        url = "#{@model.urlRoot}/#{e.target.dataset.export}/pelny"
        @mp_request(@model, url, 'POST', 'Wszystkie oferty spełnające kryteria eksportu zostały zaznaczone')

    select_all_for_export: (e) =>
        @publishEvent('log:info', "#{@module_name} select_all_for_export id:#{e.target.id} data:#{e.target.dataset.export}")
        e.preventDefault()
        @model = @collection_hard.get(e.target.dataset.export)
        url = "#{@model.urlRoot}/#{e.target.dataset.export}/zaznacz"
        @mp_request(@model, url, 'POST', 'Wszystkie oferty spełnające kryteria eksportu zostały zaznaczone')

    delete_all_for_export: (e) =>
        @publishEvent('log:info', "#{@module_name} delete_all_for_export id:#{e.target.id} data:#{e.target.dataset.export}")
        e.preventDefault()
        @model = @collection_hard.get(e.target.dataset.export)
        url = "#{@model.urlRoot}/#{e.target.dataset.export}/odznacz"
        @mp_request(@model, url, 'POST', 'Wszystkie oferty spełnające kryteria eksportu zostały odznaczone')

    attach: =>
        super
        @publishEvent('log:info', "#{@module_name} afterRender()")

