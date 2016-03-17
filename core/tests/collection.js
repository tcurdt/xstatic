'use strict'

const Changes = require('./changes')

const Glob = require('../lib/glob')
const Collection = require('../lib/collection')

Changes(function(t, cb) {
  const glob = new Glob('content/**/*')
  const collection = new Collection('test', [ glob ])
  collection.build = function(create) {
    return glob.map(function(file) {
      return create(file, [ glob ])
    })
  }
  return cb(collection)
})
