'use strict'

const Test = require('blue-tape')
const Xstatic = require('../packages/core')

const Type = require('../packages/core/enum').changes

function setup(t, cb) {
  const project = new Xstatic('build')
  const files = project.glob('content/**/*.md')
  const plugin = require('../packages/plugin-merge')(project)
  const collectionA = project.glob('content/**/*')
  const collectionB = project.glob('design/**/*')
  const collection = plugin([ collectionA, collectionB ])

  return cb(project, collection, collectionA, collectionB)
}

Test('files should be merged', function(t) {
  return setup(t, function(project, collection, collectionA, collectionB) {
    const _ = project.utils

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

