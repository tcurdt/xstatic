"use strict"

const Collection = require('../collection')

module.exports = function(project) { return function(collections, options) {

  const collection = new Collection('merge', collections, options)

  collection.onChange = function(create) {

    const inputs = Array.prototype.concat.apply([], collections)

    inputs.forEach(function(input) {
      input.forEach(function(file) {
        create(file.path, file.load, [ file ])
      })
    })
  }

  return collection
}}
