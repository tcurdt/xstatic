'use strict'

const Xstatic = require('xstatic-core')
const _ = require('@tcurdt/tinyutils')

module.exports = function(project) { return function(files, defaults) {

  const options =  _.merge({
    sort: function(a, b) { return a.file.path < b.file.path },
  }, defaults)

  const collection = new Xstatic.collection('sort', [ files ], options)

  collection.build = function(create) {
    return files.load.then(function(docs) {
      return _.collect(function(add) {

        docs.sort(options.sort)

        const len = docs.length
        let doc = null
        for(var i=0; i<len; i++) {
          const prev = doc
          doc = docs[i]
          const next = (i + 1) < len ? docs[i+1] : null

          const meta = _.merge(doc.meta, {
            prev: prev,
            next: next,
            position: i,
            length: len
          })
          doc.meta = meta

          add(create(doc.file, [ doc.file ]))
        }
      })
    })
  }

  return collection
}}
