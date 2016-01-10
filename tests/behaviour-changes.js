'use strict'

const Test = require('blue-tape')

const Type = require('../lib/enum').changes

function sortedByPath(arr) {
  arr.sort(function(a, b){
    return a.path > b.path
  })
  return arr
}

function filesFromCollection(array) {
  return array.map(function(file){ return { lmod: file.lmod, path: file.path }})
}

function filesFromChanges(array) {
  return array.map(function(change){ return { lmod: change.lmod, path: change.path, type: change.type }})
}


function setup(t) {
  const xs = require('../lib')
  const project = new xs('build')
  const collection = project.glob('content/**/*')
  const merge = require('../lib/plugins/merge')(project)
  t.equal(collection.lmod, undefined)
  return merge([ collection ])
}

Test('ignore unmatched', function(t) {
  const collection = setup(t)

  return collection.update([

    {
      type: Type.A,
      lmod: 1,
      path: 'other/index.md',
    },

  ]).then(function(changes){

    t.equal(collection.lmod, undefined)

    t.equal(changes.length, 0)
    t.equal(collection.length, 0)

  })
})

function add(t) {
  const collection = setup(t)

  return collection.update([

    {
      type: Type.A,
      lmod: 1,
      path: 'content/posts/2014/slug1/index.md',
    },

  ]).then(function(changes){

    t.equal(collection.lmod, 1)

    t.deepEqual(sortedByPath(filesFromCollection(collection)), sortedByPath([

      {
        path: 'content/posts/2014/slug1/index.md',
        lmod: 1,
      },

    ]))

    t.deepEqual(sortedByPath(filesFromChanges(changes)), sortedByPath([

      {
        path: 'content/posts/2014/slug1/index.md',
        type: Type.A,
        lmod: 1,
      },

    ]))

    return collection
  })
}

Test('add non-existing', function(t) {
  return add(t)
})

Test('add existing without modification', function(t) {
  return add(t).then(function(collection){
    return collection.update([

      {
        type: Type.A,
        lmod: 1,
        path: 'content/posts/2014/slug1/index.md',
      },

    ]).then(function(changes){

      t.equal(collection.lmod, 1)

      t.deepEqual(sortedByPath(filesFromCollection(collection)), sortedByPath([

        {
          path: 'content/posts/2014/slug1/index.md',
          lmod: 1,
        },

      ]))

      t.equal(changes.length, 0)

    })
  })
})

Test('add existing with modification', function(t) {
  return add(t).then(function(collection){
    return collection.update([

      {
        type: Type.A,
        lmod: 2,
        path: 'content/posts/2014/slug1/index.md',
      },

    ]).then(function(changes){

      t.equal(collection.lmod, 2)

      t.deepEqual(sortedByPath(filesFromCollection(collection)), sortedByPath([
        {
          path: 'content/posts/2014/slug1/index.md',
          lmod: 2,
        },
      ]))

      t.deepEqual(sortedByPath(filesFromChanges(changes)), sortedByPath([
        {
          path: 'content/posts/2014/slug1/index.md',
          type: Type.M,
          lmod: 2,
        },
      ]))

    })
  })
})

Test('modified existing', function(t) {
  return add(t).then(function(collection){
    return collection.update([
      {
        type: Type.M,
        lmod: 2,
        path: 'content/posts/2014/slug1/index.md',
      },
    ]).then(function(changes){

      t.equal(collection.lmod, 2)

      t.deepEqual(sortedByPath(filesFromCollection(collection)), sortedByPath([
        {
          path: 'content/posts/2014/slug1/index.md',
          lmod: 2,
        },
      ]))

      t.deepEqual(sortedByPath(filesFromChanges(changes)), sortedByPath([
        {
          path: 'content/posts/2014/slug1/index.md',
          type: Type.M,
          lmod: 2,
        },
      ]))

    })
  })
})

Test('modified non-existing', function(t) {
  return add(t).then(function(collection){

    return collection.update([
      {
        type: Type.M,
        lmod: 1,
        path: 'content/test',
      },

    ]).then(function(changes){

      t.equal(collection.lmod, 1)

      t.deepEqual(sortedByPath(filesFromCollection(collection)), sortedByPath([
        {
          path: 'content/posts/2014/slug1/index.md',
          lmod: 1,
        },
        {
          path: 'content/test',
          lmod: 1,
        },
      ]))

      t.deepEqual(sortedByPath(filesFromChanges(changes)), sortedByPath([
        {
          path: 'content/test',
          type: Type.A,
          lmod: 1,
        },
      ]))

    })
  })
})

Test('delete existing', function(t) {
  return add(t).then(function(collection){

    return collection.update([

      {
        type: Type.D,
        lmod: 2,
        path: 'content/posts/2014/slug1/index.md',
      },

    ]).then(function(changes){

      t.equal(collection.lmod, 2)

      t.deepEqual(sortedByPath(filesFromCollection(collection)), sortedByPath([
      ]))

      t.deepEqual(sortedByPath(filesFromChanges(changes)), sortedByPath([

        {
          path: 'content/posts/2014/slug1/index.md',
          type: Type.D,
          lmod: 2,
        },

      ]))

    })
  })
})

Test('delete non-existing', function(t) {
  const collection = setup(t)

  return collection.update([

    {
      type: Type.D,
      lmod: 2,
      path: 'content/foo.md',
    },

  ]).then(function(changes){

    t.equal(collection.lmod, undefined)

    t.equal(changes.length, 0)
    t.equal(collection.length, 0)

  })
})

// Test('test', function(t) {
//   return add(t).then(function(collection) {

//     return collection.update([]).then(function(changes) {

//       console.log('changes', changes)
//       console.log(collection.values())

//     })
//   })
// })
