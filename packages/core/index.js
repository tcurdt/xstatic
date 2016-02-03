'use strict'

const Project = require('./project')
const Collection = require('./collection')
const Utils = require('./utils')

module.exports = function(target, options) {
  const project = new Project(target, options)
  project.collection = Collection
  project.utils = Utils // FIXME
  return project
}
