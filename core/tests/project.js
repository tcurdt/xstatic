'use strict'

const Test = require('blue-tape')
const Xstatic = require('../lib')

function setup(t, cb) {
  process.chdir(__dirname + '/..');

  const project = new Xstatic('build')
  const collection = project.glob('lib/*.js')

  return cb(project, collection)
}

Test('build should find files once', function(t) {
  return setup(t, function(project, collection) {

    project.build(collection).then(function(changes) {

      t.ok(collection.length > 0, 'has results')
      t.end()

    })

  })
})
