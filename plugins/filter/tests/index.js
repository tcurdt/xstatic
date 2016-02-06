'use strict'

const Test = require('blue-tape')
const Xstatic = require('../packages/core/lib')
const Lazy = require('../packages/core/lib/lazy')
const Type = require('../packages/core/lib/changes')

function setup(t, cb) {
  const project = new Xstatic('build')
  const files = project.glob('content/**/*.js')
  const filter = require('../packages/plugin-filter')(project)
  const collection = filter('**/*.md', [ project.glob('content/**/*') ])

  return cb(project, collection)
}


Test('should only pass on matching files', function(t) {
  return setup(t, function(project, collection) {
    return collection.update([

      {
        type: Type.A,
        lmod: 1,
        path: 'content/posts/2014/slug1/index.md',
        load: Lazy.load({ body: 'content' }),
      },
      {
        type: Type.A,
        lmod: 1,
        path: 'design/styles/site.css',
        load: Lazy.load({ body: 'content' }),
      },

    ]).then(function(changes){

      t.ok(changes.length === 1, 'has right number changes')
      t.ok(collection.length === 1, 'has right number results')

      return collection.forEach(function(item){
        t.equal(item.load.isFulfilled, false, 'not unnessarily loaded')
      })

    })

  })
})

