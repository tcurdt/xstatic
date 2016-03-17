'use strict'

const Test = require('blue-tape')
const Context = require('../lib/context')
const Collection = require('../lib/collection')
const Change = require('../lib/changes')
const Glob = require('../lib/glob')
const Lazy = require('../lib/lazy')

function update(file, doc) {
  file.load = Lazy.load(doc)
  doc.file = file
  return file
}

Test('should replace collection with array', function(t) {
  const glob = new Glob('*.txt')
  const collection = new Collection('file', [ glob ])

  collection.build = function(create) {
    return glob.map(function(file) {
      return create(file, [ glob ])
    })
  }

  return collection.update([

    update({
      type: Change.A,
      lmod: 1,
      path: 'page.txt',
    }, {
      body: { data: 'a' }
    }),

  ]).then(function(r) {

    return Context.load({
      docs: collection
    }, function(v) {
      return v
    }).then(function(context) {

      // console.log(context)

      const docs = context.docs
      t.ok(docs)
      t.equal(docs.length, 1)

      const doc = docs[0]
      t.equal(doc.file.lmod, 1)
      t.equal(doc.file.path, 'page.txt')
      t.equal(doc.body.data, 'a')
    })

  })
})

Test('should replace glob with array', function(t) {
  const glob = new Glob('*.txt')
  return glob.update([

    update({
      type: Change.A,
      lmod: 1,
      path: 'page.txt',
    }, {
      body: { data: 'a' }
    }),

  ]).then(function(r) {

    return Context.load({
      docs: glob
    }, function(v) {
      return v
    }).then(function(context) {

      // console.log(context)

      const docs = context.docs
      t.ok(docs)
      t.equal(docs.length, 1)

      const doc = docs[0]
      t.equal(doc.file.lmod, 1)
      t.equal(doc.file.path, 'page.txt')
      t.equal(doc.body.data, 'a')
    })

  })
})
