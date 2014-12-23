mediator = require 'mediator'
Model = require 'models/base/model'

module.exports = class Agent extends Model
    urlRoot: "#{mediator.server_url}v1/agenci"
    schema: {}
    defaults:
        is_active: '1' # for booleans
        is_active_func: ->
            if @get('is_active') then 'tak' else 'nie'
        is_admin_func: ->
            if @get('is_admin') then 'tak' else 'nie'
        agent_type_func: ->
            switch @get('agent_type')
                 when 0 then 'pośrednik'
                 when 1 then 'admin. nieruch.'
                 when 2 then 'menadzer'
                 when 3 then 'IT'
        branch_func: ->
            if @get('branch') then localStorage.getObject('branches')["#{@get('branch')}"]

    module_name: ['agent', 'agenci']
    sufix: {'username': "@#{mediator.models.user.get('company_name')}"}
    prefix: {'phone_primary':'+48'}
