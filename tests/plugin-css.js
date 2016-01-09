"use strict"

const Test = require('blue-tape')

const Type = require('../lib/enum').changes
const _ = require('../lib/utils')

function setup(t) {
  const xs = require('../lib')
  const project = new xs('build')

  const files = project.glob('design/**/*.+(scss|sass|less|styl)')
  const plugin = require('../lib/plugins/css')(project)

  return plugin(files)
}

Test('converts sass|less|styl to css', function(t) {
  const collection = setup(t)

  return collection.update([

    {
      type: Type.A,
      lmod: 1,
      path: 'design/styles/test1.sass',
      load: _.lazyLoad({ body: 'h1 { color: black }' }),
    },
    {
      type: Type.A,
      lmod: 1,
      path: 'design/styles/test2.less',
      load: _.lazyLoad({ body: 'h1 { color: black }' }),
    },
    // {
    //   type: Type.A,
    //   lmod: 1,
    //   path: 'design/styles/test3.styl',
    //   load: _.lazyLoad({ body: 'h1\n  color black' }),
    // },

  ]).then(function(changes) {

    t.equal(changes.length, 2, 'has changes')
    t.equal(collection.length, 2, 'has result')

  })
})
