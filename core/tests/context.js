'use strict'

const Test = require('blue-tape')
const Context = require('../lib/context')
const Collection = require('../lib/collection')
const Change = require('../lib/changes')
const Glob = require('../lib/glob')
const Lazy = require('../lib/lazy')


Test('should replace collection with array', function(t) {
  const glob = new Glob('*.txt')
  const collection = new Collection('file', [ glob ])

  collection.build = function(create) {
    glob.forEach(function(file) {
      create(file.path, {}, file.load, [ file ])
    })
  }

  return collection.update([

    {
      type: Change.A,
      lmod: 1,
      path: 'page.txt',
      load: Lazy.load({ body: 'a' }),
    },

  ]).then(function(r) {

    return Context.load({
      files: collection
    }, function(v) {
      return v
    }).then(function(context) {
      t.deepEqual({ files: [ { body: 'a', path: 'page.txt', lmod: 1 } ] }, context)
    })

  })
})

Test('should replace glob with array', function(t) {
  const glob = new Glob('*.txt')
  return glob.update([

    {
      type: Change.A,
      lmod: 1,
      path: 'page.txt',
      load: Lazy.load({ body: 'a' }),
    },

  ]).then(function(r) {

    return Context.load({
      files: glob
    }, function(v) {
      return v
    }).then(function(context) {
      t.deepEqual({ files: [ { body: 'a' } ] }, context)
    })

  })
})
