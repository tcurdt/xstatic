'use strict'

const Test = require('blue-tape')

const Type = require('../lib/enum').changes
const _ = require('../lib/utils')

function setup() {
  const xs = require('../lib')
  const project = new xs('build')

  return project
}

Test('files should just be copied', function(t) {

  const project = setup()
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


Test('files should just be copied - even when going through merge', function(t) {

  const project = setup()

  const Merge = require('../lib/plugins/merge')(project)

  const collection = Merge([ project.glob('content/posts/**/index.md') ])

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
