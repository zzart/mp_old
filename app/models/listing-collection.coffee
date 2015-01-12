Model = require 'models/listing-model'
Collection = require 'models/base/collection'
mediator = require 'mediator'

module.exports = class ListingList extends Collection
    model: Model
    #url: 'http://localhost:8080/v1/oferty'
    url: "#{mediator.server_url}v1/oferty"
