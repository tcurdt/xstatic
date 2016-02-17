'use strict'

const Xstatic = require('xstatic-core')

module.exports = function(project) { return function(collections, options) {

  const collection = new Xstatic.collection('merge', collections, options)

  collection.build = function(create) {

    const inputs = Array.prototype.concat.apply([], collections)

    inputs.forEach(function(input) {
      input.forEach(function(file) {
        create(file.path, file.load, [ file ])
      })
    })
  }

  return collection
}}
