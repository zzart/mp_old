mediator = require 'mediator'
module.exports = class Client extends Chaplin.Model
    urlRoot: 'http://localhost:8080/v1/klienci'
    schema: {}
    defaults:
        is_private: '' # for booleans
