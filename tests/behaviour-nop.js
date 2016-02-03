'use strict'

const Test = require('blue-tape')
const Xstatic = require('../packages/core')
const Type = require('../packages/core/enum').changes

function setup(t, cb) {
  const project = new Xstatic('build')
  return cb(project)
}

Test('files should just be copied', function(t) {
  return setup(t, function(project) {
    const _ = project.utils
    const collection = project.glob('content/posts/**/index.md')

    return collection.update([

      {
        type: Type.A,
        lmod: 1,
        path: 'content/posts/2014/slug1/index.md',
        load: _.lazyLoad({ body: 'content' }),
      },

    ]).then(function(changes){

      t.ok(collection.length === 1, 'has results')
      return collection.forEach(function(item){
        t.equal(item.load.isFulfilled, false)
      })

    })

  })
})


Test('files should just be copied - even when going through merge', function(t) {
  return setup(t, function(project) {
    const _ = project.utils

    const merge = require('../packages/plugin-merge')(project)
    const collection = merge([ project.glob('content/posts/**/index.md') ])

    return collection.update([

      {
        type: Type.A,
        lmod: 1,
        path: 'content/posts/2014/slug1/index.md',
        load: _.lazyLoad({ body: 'content' }),
      },

    ]).then(function(changes){

      t.ok(collection.length === 1, 'has results')

      return collection.forEach(function(item){
        t.equal(item.load.isFulfilled, false)
      })

    })

  })
})
