Model = require 'models/client-model'
mediator = require 'mediator'
Collection = require 'models/base/collection'

module.exports = class ClientList extends Collection
    model: Model
    #url: 'http://localhost:8080/v1/klienci-wspolni'
    url: "#{mediator.server_url}v1/klienci-wspolni"
