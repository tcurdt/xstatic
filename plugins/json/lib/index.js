'use strict'

const Xstatic = require('xstatic-core')
const _ = require('@tcurdt/tinyutils')

module.exports = function(project) { return function(files, options) {

  const collection = new Xstatic.collection('json', [ files ], options)

  function parse(doc) {
    const json = JSON.parse(doc.body.data)
    return {
      body: {
        mime: 'object/json',
        data: json
      }
    }
  }

  collection.build = function(create) {
    return _.collect(function(add) {

      files.forEach(function(file){
        add(create({
          path: file.path,
          load: file.load.then(parse),
        }, [ file ]))
      })
    })
  }

  return collection
}}