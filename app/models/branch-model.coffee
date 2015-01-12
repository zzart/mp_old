mediator = require 'mediator'
Model = require 'models/base/model'

module.exports = class Branch extends Model
    urlRoot: "#{mediator.server_url}v1/oddzialy"
    schema: {}
    defaults:
        is_main_func: ->
            if @get('is_main') then 'tak' else 'nie'
    module_name: ['oddział', 'oddzialy', 'branch', 'branches']
    prefix: {'website':'http://', 'phone':'+48'}
    sufix: {}
