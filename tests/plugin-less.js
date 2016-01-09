"use strict"

const Test = require('blue-tape')

const Type = require('../lib/enum').changes
const _ = require('../lib/utils')

function setup(t) {
  const xs = require('../lib')
  const project = new xs('build')

  const files = project.glob('design/**/*.less')
  const plugin = require('../lib/plugins/less')(project)

  return plugin(files)
}

Test('converts less to css', function(t) {
  const collection = setup(t)

  return collection.update([
    {
      type: Type.A,
      lmod: 1,
      path: 'design/styles/test.less',
      load: _.lazyLoad({ body: 'h1 { color: black }' }),
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

Test('imports', function(t) {
  const collection = setup(t)

  return collection.update([
    {
      type: Type.A,
      lmod: 1,
      path: 'design/styles/other.less',
      load: _.lazyLoad({ body: 'h1 { color: black }' }),
    },
    {
      type: Type.A,
      lmod: 1,
      path: 'design/styles/test.less',
      load: _.lazyLoad({ body: '@import "other.less";' }),
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
