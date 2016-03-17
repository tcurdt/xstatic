'use strict'

const Test = require('blue-tape')
const Xstatic = require('xstatic-core')
const Change = Xstatic.changes
const Lazy = Xstatic.lazy

function setup(t, cb) {
  const project = new Xstatic('build')
  const files = project.glob('content/**/*.md')
  const plugin = require('../lib')(project)
  const collectionA = project.glob('content/**/*')
  const collectionB = project.glob('design/**/*')
  const collection = plugin([ collectionA, collectionB ])

  return cb(project, collection, collectionA, collectionB)
}

function update(file, doc) {
  file.load = Lazy.load(doc)
  doc.file = file
  return file
}

Test('files should be merged', function(t) {
  return setup(t, function(project, collection, collectionA, collectionB) {
    return collection.update([

      update({
        type: Change.A,
        lmod: 1,
        path: 'content/posts/2014/slug1/index.md',
      }, {
        body: { data: 'content' }
      }),
      update({
        type: Change.A,
        lmod: 1,
        path: 'design/styles/site.css',
      }, {
        body: { data: 'content' }
      }),

    ]).then(function(changes){

      t.ok(collection.length === 2, 'has right number results')
      t.ok(collectionA.length === 1, 'has right number results')
      t.ok(collectionB.length === 1, 'has right number results')

      collection.forEach(function(item){
        t.equal(item.load.isFulfilled, false, 'not unnessarily loaded')
      })

    })
  })
})

