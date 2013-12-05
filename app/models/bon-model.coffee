mediator = require 'mediator'
module.exports = class Bon extends Chaplin.Model
    urlRoot: 'http://localhost:8080/v1/biura'
    schema: {}
    # defaults:
    #     is_private: '' # for booleans
