'use strict'

const Test = require('blue-tape')
const Xstatic = require('@xstatic/core')
const Change = Xstatic.changes
const Lazy = Xstatic.lazy

function setup(t, cb) {
  const project = new Xstatic('build')
  const files = project.glob('design/**/*.+(scss|sass|less|styl)')
  const plugin = require('../lib')(project)
  const collection = plugin(files)

  return cb(project, collection)
}

Test('converts sass|less|styl to css', function(t) {
  return setup(t, function(project, collection) {
    return collection.update([

      {
        type: Change.A,
        lmod: 1,
        path: 'design/styles/test1.sass',
        load: Lazy.load({ body: 'h1 { color: black }' }),
      },
      {
        type: Change.A,
        lmod: 1,
        path: 'design/styles/test2.less',
        load: Lazy.load({ body: 'h1 { color: black }' }),
      },
      // {
      //   type: Change.A,
      //   lmod: 1,
      //   path: 'design/styles/test3.styl',
      //   load: Lazy.load({ body: 'h1\n  color black' }),
      // },

    ]).then(function(changes) {

      t.equal(changes.length, 2, 'has changes')
      t.equal(collection.length, 2, 'has result')

    })
  })
})
