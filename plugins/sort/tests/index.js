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

function update(file, doc) {
  file.load = Lazy.load(doc)
  doc.file = file
  return file
}

Test('files created in random order become sorted by path', function(t) {
  return setup(t, function(project, collection) {

    return collection.update([
      update({
        type: Change.A,
        lmod: 1,
        path: 'content/1.txt',
      }, {
        meta: { title: '1' },
        body: { data: '1' }
      }),
      update({
        type: Change.A,
        lmod: 1,
        path: 'content/3.txt',
      }, {
        meta: { title: '3' },
        body: { data: '3' }
      }),
      update({
        type: Change.A,
        lmod: 1,
        path: 'content/2.txt',
      }, {
        meta: { title: '2' },
        body: { data: '2' }
      }),
      // {
      //   type: Change.A,
      //   lmod: 1,
      //   path: 'content/1.txt',
      //   load: Lazy.load({ lmod:1, path: 'content/1.txt', body: { data: '1' }}),
      // },
      // {
      //   type: Change.A,
      //   lmod: 1,
      //   path: 'content/3.txt',
      //   load: Lazy.load({ lmod:1, path: 'content/3.txt',  body: { data: '3' }}),
      // },
      // {
      //   type: Change.A,
      //   lmod: 1,
      //   path: 'content/2.txt',
      //   load: Lazy.load({ lmod:1, path: 'content/2.txt',  body: { data: '2' }}),
      // },
    ]).then(function(changes1){

      t.equal(collection.length, 3, 'has result')

      const expected = [
        'content/3.txt',
        'content/2.txt',
        'content/1.txt',
      ]

      t.deepEqual(collection.keys(), expected, 'order')

      return collection.load.then(function(docs) {

        const b = docs[0]
        const m = docs[1]
        const e = docs[2]

        t.equal(b.meta.prev, null, 'prev')
        t.equal(b.meta.position, 0, 'position')
        t.equal(b.meta.title, '3')
        t.equal(b.meta.next.file.path, m.file.path, 'path')
        t.equal(b.meta.next.meta.position, 1)
        t.equal(b.meta.next.meta.title, '2')

        t.equal(m.meta.prev.file.path, b.file.path, 'path')
        t.equal(m.meta.prev.meta.position, 0)
        t.equal(m.meta.prev.meta.title, '3')
        t.equal(m.meta.position, 1, 'position')
        t.equal(m.meta.title, '2')
        t.equal(m.meta.next.file.path, e.file.path, 'path')
        t.equal(m.meta.next.meta.position, 2)
        t.equal(m.meta.next.meta.title, '1')

        t.equal(e.meta.prev.file.path, m.file.path, 'path')
        t.equal(e.meta.prev.meta.position, 1)
        t.equal(e.meta.prev.meta.title, '2')
        t.equal(e.meta.title, '1')
        t.equal(e.meta.position, 2, 'position')
        t.equal(e.meta.next, null, 'next')

      })
    })
  })
})
