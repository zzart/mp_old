Model = require 'models/branch-model'
mediator = require 'mediator'

module.exports = class BranchList extends Chaplin.Collection
    model: Model
    url: "#{mediator.server_url}v1/oddzialy"
    #url: 'http://localhost:8080/v1/oddzialy'
