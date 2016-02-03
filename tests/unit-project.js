'use strict'

const Test = require('blue-tape')
const Xstatic = require('../packages/core')
const Type = require('../packages/core/enum').changes
const _ = require('../packages/core/utils')

function setup(t, cb) {
  const project = new Xstatic('build')
  const collection = project.glob('packages/core/*.js')

  return cb(project, collection)
}

Test('build should find files once', function(t) {
  return setup(t, function(project, collection) {

    project.build(collection).then(function(changes) {

      t.equal(collection.length, 10, 'has results')
      t.end()

    })

  })
})
