"use strict"

const Test = require('blue-tape')

const Type = require('../lib/enum').changes
const _ = require('../lib/utils')

function setup(t) {
  const xs = require('../lib')
  const project = new xs('build')

  const files = project.glob('content/**/*.json')
  const plugin = require('../lib/plugins/json')(project)

  return plugin(files)
}

Test('parse json', function(t) {
  const collection = setup(t)

  return collection.update([
    {
      type: Type.A,
      lmod: 1,
      path: 'content/test.json',
      load: _.lazyLoad({ body: '{ "a": 2 }' }),
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
