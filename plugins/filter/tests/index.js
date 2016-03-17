'use strict'

const Test = require('blue-tape')
const Xstatic = require('xstatic-core')
const Lazy = Xstatic.lazy
const Change = Xstatic.changes

function setup(t, cb) {
  const project = new Xstatic('build')
  const files = project.glob('content/**/*.js')
  const filter = require('../lib')(project)
  const collection = filter('**/*.md', [ project.glob('content/**/*') ])

  return cb(project, collection)
}

function update(file, doc) {
  file.load = Lazy.load(doc)
  doc.file = file
  return file
}

Test('should only pass on matching files', function(t) {
  return setup(t, function(project, collection) {
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

      t.equal(changes.length, 1, 'has right number changes')
      t.equal(collection.length, 1, 'has right number results')

      return collection.forEach(function(item){
        t.equal(item.load.isFulfilled, false, 'not unnessarily loaded')
      })

    })

  })
})

