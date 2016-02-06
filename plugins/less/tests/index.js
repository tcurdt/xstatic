'use strict'

const Test = require('blue-tape')
const Xstatic = require('@xstatic/core')
const Change = Xstatic.changes
const Lazy = Xstatic.lazy

function setup(t, cb) {
  const project = new Xstatic('build')
  const files = project.glob('design/**/*.less')
  const plugin = require('../lib')(project)
  const collection = plugin(files)

  return cb(project, collection)
}


Test('converts less to css', function(t) {
  return setup(t, function(project, collection) {
    return collection.update([
      {
        type: Change.A,
        lmod: 1,
        path: 'design/styles/test.less',
        load: Lazy.load({ body: 'h1 { color: black }' }),
      },
    ]).then(function(changes1){

      t.ok(collection.length === 1, 'has result')

      const file = collection.get('design/styles/test.css')

      t.ok(file, 'exists')

      return file.load.then(function(f){
        t.ok(f.body.match(/^h1/), 'has css')
        // t.ok(f.body.match(/sourceMappingURL/), 'has map')
      })

    })
  })
})

Test('imports', function(t) {
  return setup(t, function(project, collection) {
    return collection.update([
      {
        type: Change.A,
        lmod: 1,
        path: 'design/styles/other.less',
        load: Lazy.load({ body: 'h1 { color: black }' }),
      },
      {
        type: Change.A,
        lmod: 1,
        path: 'design/styles/test.less',
        load: Lazy.load({ body: '@import "other.less";' }),
      },
    ]).then(function(changes1){

      t.ok(collection.length === 2, 'has result')

      const file = collection.get('design/styles/test.css')

      t.ok(file, 'exists')

      return file.load.then(function(f){
        t.ok(f.body.match(/^h1/), 'has css')
      })

    })
  })
})
