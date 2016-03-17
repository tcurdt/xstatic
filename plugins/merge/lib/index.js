'use strict'

const Xstatic = require('xstatic-core')
const _ = require('@tcurdt/tinyutils')

module.exports = function(project) { return function(collections, options) {

  const collection = new Xstatic.collection('merge', collections, options)

  collection.build = function(create) {
    return _.collect(function(add) {
      const inputs = Array.prototype.concat.apply([], collections)

      inputs.forEach(function(input) {
        input.forEach(function(file) {
          add(create(file, [ file ]))
        })
      })
    })
  }

  return collection
}}
