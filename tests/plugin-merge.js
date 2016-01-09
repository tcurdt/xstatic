"use strict"

const Test = require('blue-tape')

const Type = require('../lib/enum').changes
const _ = require('../lib/utils')

function setup(cb) {
  const xs = require('../lib')
  const project = new xs('build')

  const Merge = require('../lib/plugins/merge')(project)

  const collectionA = project.glob('content/**/*')
  const collectionB = project.glob('design/**/*')
  const collection = Merge([ collectionA, collectionB ])

  return cb(collection, collectionA, collectionB)
}

Test('files should be merged', function(t) {

  return setup(function(collection, collectionA, collectionB){

    return collection.update([

      {
        type: Type.A,
        lmod: 1,
        path: 'content/posts/2014/slug1/index.md',
        load: _.lazyLoad({ body: 'content' }),
      },
      {
        type: Type.A,
        lmod: 1,
        path: 'design/styles/site.css',
        load: _.lazyLoad({ body: 'content' }),
      },

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

