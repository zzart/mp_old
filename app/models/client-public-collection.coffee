Model = require 'models/client-model'
mediator = require 'mediator'

module.exports = class ClientList extends Chaplin.Collection
    model: Model
    #url: 'http://localhost:8080/v1/klienci-wspolni'
    url: "#{mediator.server_url}v1/klienci-wspolni"
