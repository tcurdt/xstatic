'use strict'

const Test = require('blue-tape')
const Xstatic = require('../packages/core/lib')
const Type = require('../packages/core/lib/changes')
const Lazy = require('../packages/core/lib/lazy')

function setup(t, cb) {
  const project = new Xstatic('build')
  const files = project.glob('content/**/*.js')
  const plugin = require('../packages/plugin-babel')(project)
  const collection = plugin(files)

  return cb(project, collection)
}

Test('compiles jsx to js', function(t) {
  return setup(t, function(project, collection) {

    return collection.update([
      {
        type: Type.A,
        lmod: 1,
        path: 'content/test.js',
        load: Lazy.load({ body: 'const doc = <div>JSX</div>' }),
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
})
