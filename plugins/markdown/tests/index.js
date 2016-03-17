'use strict'

const Test = require('blue-tape')
const Xstatic = require('xstatic-core')
const Change = Xstatic.changes
const Lazy = Xstatic.lazy

function setup(t, cb) {
  const project = new Xstatic('build')
  const files = project.glob('content/**/*.md')
  const plugin = require('../lib')(project)
  const collection = plugin(files)

  return cb(project, collection)
}

function update(file, doc) {
  file.load = Lazy.load(doc)
  doc.file = file
  return file
}

Test('converts markdown to html', function(t) {
  return setup(t, function(project, collection) {
    return collection.update([

      update({
        type: Change.A,
        lmod: 1,
        path: 'content/posts/2014/slug1/index.md',
      }, {
        body: { data: '# test' }
      }),

    ]).then(function(changes1){

      t.equal(collection.length, 1, 'has result')

      const file = collection.get('content/posts/2014/slug1/index.html')

      t.ok(file, 'exists')

      return file.load.then(function(doc){
        t.equal(doc.body.data, '<h1 id="test">test</h1>\n')
      })

    })
  })
})
