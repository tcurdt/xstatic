'use strict'

const Xstatic = require('xstatic-core')

module.exports = function(project) { return function(files, options) {

  const collection = new Xstatic.collection('json', [ files ], options)

  function parse(file) {
    const json = JSON.parse(file.body)
    return {
      json: json
    }
  }

  collection.build = function(create) {

    files.forEach(function(file){
      create({
	path: file.path,
	load: file.load.then(parse),
      }, [ file ])
    })
  }

  return collection
}}