'use strict'

const Test = require('blue-tape')
const Xstatic = require('@xstatic/core')
const Change = Xstatic.changes
const Lazy = Xstatic.lazy

function setup(t, cb) {
  const project = new Xstatic('build')
  const files = project.glob('design/**/*.+(scss|sass)')
  const plugin = require('../lib')(project)
  const collection = plugin(files)

  return cb(project, collection)
}

Test('converts scss to css', function(t) {
  return setup(t, function(project, collection) {
    const _ = project.utils

    return collection.update([
      {
        type: Change.A,
        lmod: 1,
        path: 'design/styles/test.scss',
        load: Lazy.load({
          path: 'design/styles/test.scss',
          body: '$color: black;\nh1 { color: $color }'
        }),
      },
    ]).then(function(changes1){

      t.ok(collection.length === 1, 'has result')

      const file = collection.get('design/styles/test.css')

      t.ok(file, 'exits')

      return file.load.then(function(f){
        console.log(f)
        t.ok(f.body.match(/^h1/), 'has css')
      })

    })
  })
})

Test('imports', function(t) {
  return setup(t, function(project, collection) {
    const _ = project.utils

    return collection.update([
      {
        type: Change.A,
        lmod: 1,
        path: 'design/styles/other.scss',
        load: Lazy.load({
          path: 'design/styles/other.scss',
          body: 'h1 { color: black }'
        }),
      },
      {
        type: Change.A,
        lmod: 1,
        path: 'design/styles/test.scss',
        load: Lazy.load({
          path: 'design/styles/test.scss',
          body: '@import "other.scss"'
        }),
      },
    ]).then(function(changes1){

      t.ok(collection.length === 2, 'has result')

      const file = collection.get('design/styles/test.css')

      t.ok(file, 'exits')

      return file.load.then(function(f){
        t.ok(f.body.match(/^h1/), 'has css')
      })

    })
  })
})
