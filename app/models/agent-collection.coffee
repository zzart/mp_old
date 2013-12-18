Model = require 'models/agent-model'

module.exports = class AgentList extends Chaplin.Collection
    model: Model
    url: 'http://localhost:8080/v1/agenci'

