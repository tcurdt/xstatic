'use strict'

const Project = require('./project')
const Collection = require('./collection')
const Context = require('./context')

module.exports = function(target, options) {
  return new Project(target, options)
}

module.exports.collection = Collection
module.exports.context = Context