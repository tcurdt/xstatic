'use strict'

const Test = require('blue-tape')
const Xstatic = require('xstatic-core')
const Change = Xstatic.changes
const Lazy = Xstatic.lazy

function setup(t, cb) {
  const project = new Xstatic('build')
  const files = project.glob('content/**/*.js')
  const plugin = require('../lib')(project)
  const collection = plugin(files)

  return cb(project, collection)
}

function update(file, doc) {
  file.load = Lazy.load(doc)
  doc.file = file
  return file
}

Test('compiles jsx to js', function(t) {
  return setup(t, function(project, collection) {

    return collection.update([

      update({
        type: Change.A,
        lmod: 1,
        path: 'content/test.js',
      }, {
        meta: { title: 'title post1' },
        body: { data: 'const doc = <div>JSX</div>' }
      }),

    ]).then(function(changes){

      t.ok(collection.length === 1, 'has results')

      const file = collection.get('content/test.js')

      t.ok(file, 'exists')

      return file.load.then(function(f){
        t.ok(f.body.data.includes('React.createElement'), 'transpile JSX to JS')
      })

      // collection.get('content/test.js.map').load.then(function(f){
      //   t.ok(f.body.includes('mappings'), 'create source map')
      // })

    })

  })
})
