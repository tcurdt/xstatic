'use strict'

const Test = require('blue-tape')
const Xstatic = require('xstatic-core')
const Change = Xstatic.changes
const Lazy = Xstatic.lazy

function setup(t, cb) {
  const project = new Xstatic('build')
  const files = project.glob('content/**/*.txt')
  const plugin = require('../lib')(project)
  const collection = plugin(files)

  return cb(project, collection)
}

function matches(t, a, b) {
  return t.equal(a && a.path, b && b.path)
}

Test('files created in random order become sorted by path', function(t) {
  return setup(t, function(project, collection) {

    return collection.update([
      {
        type: Change.A,
        lmod: 1,
        path: 'content/1.txt',
        load: Lazy.load({ body: { data: '1' }}),
      },
      {
        type: Change.A,
        lmod: 1,
        path: 'content/3.txt',
        load: Lazy.load({ body: { data: '3' }}),
      },
      {
        type: Change.A,
        lmod: 1,
        path: 'content/2.txt',
        load: Lazy.load({ body: { data: '2' }}),
      },
    ]).then(function(changes1){

      t.ok(collection.length === 3, 'has result')

      const expected = [
        'content/3.txt',
        'content/2.txt',
        'content/1.txt',
      ]
      t.deepEqual(collection.keys(), expected, 'order')

      const files = collection.values()
      const b = files[0]
      const m = files[1]
      const e = files[2]

      matches(t, b.meta.prev, null)
      matches(t, b.meta.next, m)

      matches(t, m.meta.prev, b)
      matches(t, m.meta.next, e)

      matches(t, e.meta.prev, m)
      matches(t, e.meta.next, null)

    })

  })
})
