mediator = require 'mediator'
module.exports = class Agent extends Chaplin.Model
    urlRoot: 'http://localhost:8080/v1/agenci'
    schema: {}
    defaults:
        is_active: '1' # for booleans
