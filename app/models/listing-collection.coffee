Model = require 'models/listing-model'

module.exports = class ListingList extends Chaplin.Collection
  model: Model
  url: 'http://localhost:8080/v1/oferty'
