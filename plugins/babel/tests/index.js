'use strict'

const Test = require('blue-tape')
const Xstatic = require('@xstatic/core')
const Change = Xstatic.changes
const Lazy = Xstatic.lazy

function setup(t, cb) {
  const project = new Xstatic('build')
  const files = project.glob('content/**/*.js')
  const plugin = require('../lib')(project)
  const collection = plugin(files)

  return cb(project, collection)
}

Test('compiles jsx to js', function(t) {
  return setup(t, function(project, collection) {

    return collection.update([
      {
        type: Change.A,
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
