#Chaplin = require 'chaplin'
mediator = require 'mediator'

module.exports = class Model extends Chaplin.Model
    # Mixin a synchronization state machine
    # _(@prototype).extend Chaplin.SyncMachine
    initialize: ->
        # backbone events -------------
        @on('change', @onChange)
        @on('add', @onAdd)
        @on('remove', @onRemove)
        @on('destroy', @onDestory)
        @on('sync', @onSync)

    onSync: ->
        @publishEvent('log:debug',"--> #{@module_name[0]} sync")
    onChange: ->
        @publishEvent('log:debug',"--> #{@module_name[0]} changed")
    onAdd: ->
        @publishEvent('log:debug',"--> #{@module_name[0]} add")
    onDestroy: ->
        @publishEvent('log:debug',"--> #{@module_name[0]} destroyed")
    onRemove: ->
        @publishEvent('log:debug',"--> #{@module_name[0]} remove")

    # permissions ------------------------------------------------
    author: undefined # implement it higher
    branch_edit_allowed: false
    admin_only_edit_allowed: false

    can_edit: (edit_type=false)->
        user_id = mediator.models.user.get('id')
        branch_id = mediator.models.user.get('branch_id')
        admin = mediator.models.user.get('is_admin')
        @publishEvent('log:debug',"""
            permissions: ->
                admin: #{admin}
                user_id: #{user_id}
                branch_id: #{branch_id}
                object's branch: #{@.get('branch')}
                author: #{@author}
                branch_edit_allowed: #{@branch_edit_allowed}
                admin_only_edit_allowed: #{@admin_only_edit_allowed}
                edit_type: #{edit_type}
        """)
        if admin
            return true
        if @admin_only_edit_allowed
            # no need to check any further
            return false

        if edit_type is 'add'
            # if route is add and admin_only_edit_allowed is false
            # then everyone can add elements ....
            return true

        if @branch_edit_allowed
            # see which branch model belongs to and which branch is the user
            if @.get('branch') == branch_id
                return true
        else
            # else comare based on authors
            if @.get(@author) == user_id
                return true
        return false
    # permissions ------------------------------------------------

    update: ->
        # after change in name need to regenerate forms and localStorage
        # all needs to take off with a slight delay so that model has a chance to save itself
        self = @
        _.delay(->
            self.publishEvent('modelchanged', 'client')
        , 30)

    get: (attr) ->
        value = Backbone.Model::get.call(this, attr)
        (if _.isFunction(value) then value.call(this) else value)
    toJSON: ->
        data = {}
        json = Backbone.Model::toJSON.call(this)
        _.each(json, (value, key) ->
            data[key] = @get(key)
        , this)
        data
    get_name: ->
        @get('name')
    get_url: ->
        return "<a href=\'/#{@module_name[1]}/#{@get('id')}\'>#{@module_name[0].toUpperCase()} ##{@get('id')}</a>"

    slugify: (text) ->
        text.toString().toLowerCase()
            .replace(/\s+/g, '-')           #  Replace spaces with -
            .replace(/[^\w\-]+/g, '')       #  Remove all non-word chars
            .replace(/\-\-+/g, '-')         #  Replace multiple - with single -
            .replace(/^-+/, '')             #  Trim - from start of text
            .replace(/-+$/, '')             #  Trim - from end of text
