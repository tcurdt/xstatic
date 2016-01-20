'use strict'

const Test = require('blue-tape')

const Type = require('../lib/enum').changes
const _ = require('../lib/utils')


function setup() {
  const xs = require('../lib')
  return new xs('build')
}

Test('build should find files once', function(t) {

  const project = setup()
  const collection = project.glob('lib/*.js')
  project.build(collection).then(function(changes) {

    t.equal(collection.length, 10, 'has results')
    t.end()

  })
})
