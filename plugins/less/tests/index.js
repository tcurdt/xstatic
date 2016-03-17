'use strict'

const Test = require('blue-tape')
const Xstatic = require('xstatic-core')
const Change = Xstatic.changes
const Lazy = Xstatic.lazy

function setup(t, cb) {
  const project = new Xstatic('build')
  const files = project.glob('design/**/*.less')
  const plugin = require('../lib')(project)
  const collection = plugin(files)

  return cb(project, collection)
}

function update(file, doc) {
  file.load = Lazy.load(doc)
  doc.file = file
  return file
}

Test('converts less to css', function(t) {
  return setup(t, function(project, collection) {
    return collection.update([

      update({
        type: Change.A,
        lmod: 1,
        path: 'design/styles/test.less',
      }, {
        body: { data: 'h1 { color: black }' }
      }),

    ]).then(function(changes1){

      t.equal(collection.length, 1, 'has result')

      const file = collection.get('design/styles/test.css')

      t.ok(file, 'exists')

      return file.load.then(function(doc){
        t.ok(doc.body.data.match(/^h1/), 'has css')
        // t.ok(f.body.match(/sourceMappingURL/), 'has map')
      })

    })
  })
})

Test('imports', function(t) {
  return setup(t, function(project, collection) {
    return collection.update([

      update({
        type: Change.A,
        lmod: 1,
        path: 'design/styles/other.less',
      }, {
        body: { data: 'h1 { color: black }' }
      }),

      update({
        type: Change.A,
        lmod: 1,
        path: 'design/styles/test.less',
      }, {
        body: { data: '@import "other.less";' }
      }),

    ]).then(function(changes1){

      t.equal(collection.length, 2, 'has result')

      const file = collection.get('design/styles/test.css')

      t.ok(file, 'exists')

      return file.load.then(function(doc){
        t.ok(doc.body.data.match(/^h1/), 'has h1')
      })

    })
  })
})
