'use strict'

const Test = require('blue-tape')
const Xstatic = require('@xstatic/core')
const Change = Xstatic.changes
const Lazy = Xstatic.lazy

function setup(t, cb) {
  const project = new Xstatic('build')
  const files = project.glob('content/**/*.json')
  const plugin = require('../lib')(project)
  const collection = plugin(files)

  return cb(project, collection)
}


Test('parse json', function(t) {
  return setup(t, function(project, collection) {
    return collection.update([
      {
        type: Change.A,
        lmod: 1,
        path: 'content/test.json',
        load: Lazy.load({ body: '{ "a": 2 }' }),
      },
    ]).then(function(changes1){

      t.ok(collection.length === 1, 'has result')

      const file = collection.get('content/test.json')

      t.ok(file, 'exists')

      return file.load.then(function(content){
        t.equal(content.json.a, 2)
      })

    })
  })
})
