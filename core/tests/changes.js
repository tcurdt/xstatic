'use strict'

const Test = require('blue-tape')
const Change = require('../lib/changes')
const Lazy = require('../lib/lazy')

const FILES = 'files should match'
const CHANGES = 'changes should match'

function update(file, doc) {
  file.load = Lazy.load(doc)
  doc.file = file
  return file
}

module.exports = function(setup) {

  function fileFilter(array) {
    return array.map(function(file) { return {
      path: file.path,
      lmod: file.lmod,
    }})
  }

  function changeFilter(array) {
    return array.map(function(change) { return {
      type: change.type,
      path: change.path,
      lmod: change.lmod,
    }})
  }

  Test('ignore unmatched', function(t) {
    return setup(t, function(collection) {
      return collection.update([

        update({
          type: Change.A,
          lmod: 1,
          path: 'other/index.md',
        }, {
          body: { data: 'content' }
        }),

      ]).then(function(changes){

        t.equal(changes.length, 0, 'no changes')
        t.equal(collection.length, 0, 'no files')
        t.equal(collection.lmod, undefined, 'no lmod')

      })
    })
  })

  function add(t) {
    return setup(t, function(collection) {
      return collection.update([

        update({
          type: Change.A,
          lmod: 1,
          path: 'content/posts/2014/slug1/index.md',
        }, {
          body: { data: 'content' }
        }),

      ]).then(function(changes){

        t.equal(collection.lmod, 1)

        t.deepEqual(fileFilter(collection), fileFilter([

          {
            path: 'content/posts/2014/slug1/index.md',
            lmod: 1,
          },

        ]))

        t.deepEqual(changeFilter(changes), changeFilter([

          {
            path: 'content/posts/2014/slug1/index.md',
            type: Change.A,
            lmod: 1,
          },

        ]))

        return collection
      })
    })
  }

  Test('initial add', function(t) {
    return add(t).then(function(collection) {
      return collection.load.then(function(docs) {
        docs.forEach(function(doc) {
          console.log(doc)
          t.ok(doc.body)
          t.ok(doc.file)
          t.ok(doc.file.lmod)
          t.ok(doc.file.path)
          t.ok(doc.file.load)
        })
      }).then(function() {
        return collection
      })
    })
  })

  Test('add existing (without modification)', function(t) {
    return add(t).then(function(collection){
      return collection.update([

        update({
          type: Change.A,
          lmod: 1,
          path: 'content/posts/2014/slug1/index.md',
        }, {
          body: { data: 'content' }
        }),

      ]).then(function(changes) {

        t.equal(collection.lmod, 1)

        t.deepEqual(fileFilter(collection), fileFilter([

          {
            path: 'content/posts/2014/slug1/index.md',
            lmod: 1,
          },

        ]))

        t.equal(changes.length, 0)

      })
    })
  })

  Test('add existing (with modification)', function(t) {
    return add(t).then(function(collection){
      return collection.update([

        update({
          type: Change.A,
          lmod: 2,
          path: 'content/posts/2014/slug1/index.md',
        }, {
          body: { data: 'content' }
        }),

      ]).then(function(changes){

        t.equal(collection.lmod, 2)

        t.deepEqual(fileFilter(collection), fileFilter([
          {
            path: 'content/posts/2014/slug1/index.md',
            lmod: 2,
          },
        ]))

        t.deepEqual(changeFilter(changes), changeFilter([
          {
            path: 'content/posts/2014/slug1/index.md',
            type: Change.M,
            lmod: 2,
          },
        ]))

      })
    })
  })

  Test('modified (existing)', function(t) {
    return add(t).then(function(collection) {
      return collection.update([

        update({
          type: Change.A,
          lmod: 2,
          path: 'content/posts/2014/slug1/index.md',
        }, {
          body: { data: 'content' }
        }),

      ]).then(function(changes) {

        t.equal(collection.lmod, 2)

        t.deepEqual(fileFilter(collection), fileFilter([
          {
            path: 'content/posts/2014/slug1/index.md',
            lmod: 2,
          },
        ]))

        t.deepEqual(changeFilter(changes), changeFilter([
          {
            path: 'content/posts/2014/slug1/index.md',
            type: Change.M,
            lmod: 2,
          },
        ]))

      })
    })
  })

  Test('modified (non-existing)', function(t) {
    return add(t).then(function(collection) {
      return collection.update([

        update({
          type: Change.M,
          lmod: 1,
          path: 'content/test',
        }, {
          body: { data: 'content' }
        }),

      ]).then(function(changes) {

        t.equal(collection.lmod, 1)

        t.deepEqual(fileFilter(collection), fileFilter([
          {
            path: 'content/posts/2014/slug1/index.md',
            lmod: 1,
          },
          {
            path: 'content/test',
            lmod: 1,
          },
        ]), FILES)

        t.deepEqual(changeFilter(changes), changeFilter([
          {
            path: 'content/test',
            type: Change.A,
            lmod: 1,
          },
        ]), CHANGES)

      })
    })
  })

  Test('delete (existing)', function(t) {
    return add(t).then(function(collection) {
      return collection.update([

        update({
          type: Change.D,
          lmod: 2,
          path: 'content/posts/2014/slug1/index.md',
        }, {
          body: { data: 'content' }
        }),

      ]).then(function(changes) {

        t.equal(collection.lmod, 2)

        t.deepEqual(fileFilter(collection), fileFilter([
        ]), FILES)

        t.deepEqual(changeFilter(changes), changeFilter([

          {
            path: 'content/posts/2014/slug1/index.md',
            type: Change.D,
            lmod: 2,
          },

        ]), CHANGES)

      })
    })
  })

  Test('delete (non-existing)', function(t) {
    return setup(t, function(collection) {
      return collection.update([

        update({
          type: Change.D,
          lmod: 2,
          path: 'content/foo.md',
        }, {
          body: { data: 'content' }
        }),

      ]).then(function(changes) {

        t.equal(collection.lmod, undefined, 'lmod')
        t.equal(changes.length, 0, 'changes')
        t.equal(collection.length, 0, 'collection')

      })
    })
  })


}

