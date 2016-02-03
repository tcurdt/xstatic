'use strict'

const Test = require('blue-tape')
const Xstatic = require('../packages/core')

const Type = require('../packages/core/enum').changes

function setup(t, cb) {
  const project = new Xstatic('build')
  const files = project.glob('content/**/*.js')
  const filter = require('../packages/plugin-filter')(project)
  const collection = filter('**/*.md', [ project.glob('content/**/*') ])

  return cb(project, collection)
}


Test('should only pass on matching files', function(t) {
  return setup(t, function(project, collection) {
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

      t.ok(changes.length === 1, 'has right number changes')
      t.ok(collection.length === 1, 'has right number results')

      return collection.forEach(function(item){
        t.equal(item.load.isFulfilled, false, 'not unnessarily loaded')
      })

    })

  })
})

