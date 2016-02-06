'use strict'

const Project = require('./project')
const Collection = require('./collection')
const Context = require('./context')
const Changes = require('./changes')
const Lazy = require('./lazy')

module.exports = function(target, options) {
  const project = new Project(target, options)
  project.xstatic = this
  return project
}

module.exports.collection = Collection
module.exports.context = Context
module.exports.changes = Changes
module.exports.lazy = Lazy