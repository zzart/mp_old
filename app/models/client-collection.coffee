Model = require 'models/client-model'

module.exports = class ClientList extends Chaplin.Collection
  model: Model
  url: 'http://localhost:8080/v1/klienci'
