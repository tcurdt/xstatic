"use strict"

const Minimatch = require('minimatch')

const Collection = require('../collection')

module.exports = function(project) { return function(pattern, collections, options) {

  const collection = new Collection('filter-' + pattern, collections, options)

  collection.onChange = function(create) {
    const inputs = Array.prototype.concat.apply([], collections)

    inputs.forEach(function(input) {
      // console.log('filter', pattern, input.keys())
      input.forEach(function(file) {
        if (Minimatch(file.path, pattern)) {
          create(file.path, file.load, [ file ])
          // console.log('filter', 'OK', file.path)
        } else {
          // console.log('filter', 'KO', file.path)
        }
      })
    })
  }

  return collection
}}