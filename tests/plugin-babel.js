"use strict"

const Test = require('blue-tape')

const Type = require('../lib/enum').changes
const _ = require('../lib/utils')

function setup(t) {
  const xs = require('../lib')
  const project = new xs('build')

  const files = project.glob('content/**/*.js')
  const babel = require('../lib/plugins/babel')(project)

  return babel(files)
}

Test('compiles jsx to js', function(t) {
  const collection = setup(t)

  return collection.update([
    {
      type: Type.A,
      lmod: 1,
      path: 'content/test.js',
      load: _.lazyLoad({ body: 'const doc = <div>JSX</div>' }),
    },
  ]).then(function(changes){

    t.ok(collection.length === 1, 'has results')

    const file = collection.get('content/test.js')

    t.ok(file, 'exists')

    return file.load.then(function(f){
      t.ok(f.body.includes('React.createElement'), 'transpile JSX to JS')
    })

    // collection.get('content/test.js.map').load.then(function(f){
    //   t.ok(f.body.includes('mappings'), 'create source map')
    // })

  })
})
