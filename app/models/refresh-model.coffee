mediator = require 'mediator'
Model = require 'models/base/model'

module.exports = class Refresh extends Model
    #urlRoot: 'http://localhost:8080/v1/refresh'
    urlRoot: =>
        "#{mediator.server_url}v1/refresh"
    module_name: ['refresh', 'refresh']
