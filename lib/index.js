"use strict"

const Project = require('./project')

module.exports = function(target, options) {
  return new Project(target, options)
}
