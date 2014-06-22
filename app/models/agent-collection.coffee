Model = require 'models/agent-model'
mediator = require 'mediator'

module.exports = class AgentList extends Chaplin.Collection
    model: Model
    #url: 'http://localhost:8080/v1/agenci'
    url: "#{mediator.server_url}v1/agenci"

