Model = require 'models/offer-list-model'

module.exports = class OfferList extends Chaplin.Collection
  model: Model
  url: 'http://localhost:8080/mp/oferty'
