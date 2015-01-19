mediator = require 'mediator'
Model = require 'models/base/model'

module.exports = class Company extends Model
    urlRoot: "#{mediator.server_url}v1/biura"
    schema: {}
    # defaults:
    #     is_private: '' # for booleans
    module_name: ['biuro', 'biura', 'company', 'companies']
    prefix: {'website':'http://', 'phone':'+48'}
    sufix: {}
    get_url: ->
        return "<a href=\'/#{@module_name[1]}/#{@get('id')}\'>#{@module_name[0].toUpperCase()} ##{@get('id')}</a>"
    admin_only_edit_allowed: true
