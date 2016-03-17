'use strict'

const Test = require('blue-tape')
const Xstatic = require('xstatic-core')
const Lazy = Xstatic.lazy
const Change = Xstatic.changes


function update(file, doc) {
  file.load = Lazy.load(doc)
  doc.file = file
  return file
}

function setup(t, cb) {
  const project = new Xstatic('build')
  return cb(project)
}

Test('files should just be copied', function(t) {
  return setup(t, function(project) {
    const collection = project.glob('content/posts/**/index.md')

    return collection.update([

      update({
        type: Change.A,
        lmod: 1,
        path: 'content/posts/2014/slug1/index.md',
      }, {
        body: { data: 'content' }
      }),

    ]).then(function(changes) {

      t.equal(collection.length, 1, 'has results')
      return collection.forEach(function(item) {
        t.equal(item.load.isFulfilled, false)
      })

    })
  })
})

Test('files should just be copied - even when going through merge', function(t) {
  return setup(t, function(project) {
    const merge = require('xstatic-merge')(project)
    const collection = merge([ project.glob('content/posts/**/index.md') ])

    return collection.update([

      update({
        type: Change.A,
        lmod: 1,
        path: 'content/posts/2014/slug1/index.md',
      }, {
        body: { data: 'content' }
      }),

    ]).then(function(changes) {

      t.equal(collection.length, 1, 'has results')

      return collection.forEach(function(item) {
        t.equal(item.load.isFulfilled, false)
      })

    })
  })
})
