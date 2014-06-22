mediator = require 'mediator'

module.exports = class Refresh extends Chaplin.Model
    #urlRoot: 'http://localhost:8080/v1/refresh'
    urlRoot: =>
        "#{mediator.server_url}v1/refresh"
