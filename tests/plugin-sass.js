'use strict'

const Test = require('blue-tape')

const Type = require('../lib/enum').changes
const _ = require('../lib/utils')

function setup(t) {
  const Xstatic = require('../lib')
  const project = new Xstatic('build')

  const files = project.glob('design/**/*.+(scss|sass)')
  const plugin = require('../lib/plugins/sass')(project)

  return plugin(files)
}

Test('converts scss to css', function(t) {
  const collection = setup(t)

  return collection.update([
    {
      type: Type.A,
      lmod: 1,
      path: 'design/styles/test.scss',
      load: _.lazyLoad({
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

Test('imports', function(t) {
  const collection = setup(t)

  return collection.update([
    {
      type: Type.A,
      lmod: 1,
      path: 'design/styles/other.scss',
      load: _.lazyLoad({
        path: 'design/styles/other.scss',
        body: 'h1 { color: black }'
      }),
    },
    {
      type: Type.A,
      lmod: 1,
      path: 'design/styles/test.scss',
      load: _.lazyLoad({
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
