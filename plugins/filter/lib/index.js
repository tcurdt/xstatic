'use strict'

const Xstatic = require('xstatic-core')

const Minimatch = require('minimatch')

module.exports = function(project) { return function(pattern, collections, options) {

  const collection = new Xstatic.collection('filter-' + pattern, collections, options)

  collection.build = function(create) {
    const inputs = Array.prototype.concat.apply([], collections)

    inputs.forEach(function(input) {
      // console.log('filter', pattern, input.keys())
      input.forEach(function(file) {
	if (Minimatch(file.path, pattern)) {
	  create(file, [ file ])
	  // console.log('filter', 'OK', file.path)
	} else {
	  // console.log('filter', 'KO', file.path)
        }
      })
    })
  }

  return collection
}}