'use strict'

const Changes = require('./changes')

const Glob = require('../lib/glob')
const Collection = require('../lib/collection')

Changes(function(t, cb) {
  const glob = new Glob('content/**/*')
  const collection = new Collection('test', [ glob ])
  collection.onChange = function(create) {
    glob.forEach(function(file) {
      create(file.path, file.load, [ glob ])
    })
  }
  return cb(collection)
})
