Model = require 'models/branch-model'

module.exports = class BranchList extends Chaplin.Collection
  model: Model
  url: 'http://localhost:8080/v1/oddzialy'
