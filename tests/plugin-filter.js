"use strict"

const Test = require('blue-tape')

const Type = require('../lib/enum').changes
const _ = require('../lib/utils')

function setup() {
  const xs = require('../lib')
  const project = new xs('build')

  const Filter = require('../lib/plugins/filter')(project)

  return Filter('**/*.md', [ project.glob('content/**/*') ])
}

Test('should only pass on matching files', function(t) {

  const collection = setup()

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

    t.ok(changes.length === 1, 'has right number changes')
    t.ok(collection.length === 1, 'has right number results')

    return collection.forEach(function(item){
      t.equal(item.load.isFulfilled, false, 'not unnessarily loaded')
    })

  })
})

