'use strict'

const Test = require('blue-tape')
const Xstatic = require('../lib')
const Change = require('../lib/changes')
const Cache = require('../lib/cache')

Test('cache modifications', function(t) {
  const cache = new Cache({})

  t.deepEqual(cache.keys(), [
  ])
  const mod1 = cache.applyFiles([
    {
      path: 'path1',
      lmod: 1
    },
    {
      path: 'path2',
      lmod: 2
    },
    {
      path: 'path3',
      lmod: 3
    }
  ], 3)
  // + path1
  // + path2
  // + path3
  t.deepEqual(mod1, [
    {
      path: 'path1',
      type: Change.A,
      lmod: 1
    },
    {
      path: 'path2',
      type: Change.A,
      lmod: 2
    },
    {
      path: 'path3',
      type: Change.A,
      lmod: 3
    }
  ])
  t.deepEqual(cache.keys(), [
    'path1',
    'path2',
    'path3',
  ])

  const mod2 = cache.applyFiles([
    // {
    //   path: 'path1',
    //   lmod: 1
    // },
    {
      path: 'path2',
      lmod: 2
    },
    {
      path: 'path3',
      lmod: 3+1
    },
    {
      path: 'path4',
      lmod: 4
    }
  ], 4)
  // - path1
  // = path2
  // ! path3
  // + path4
  t.deepEqual(mod2, [
    // {
    //   path: 'path2',
    //   type: Change.M,
    //   lmod: 2
    // },
    {
      path: 'path3',
      type: Change.M,
      lmod: 3+1
    },
    {
      path: 'path4',
      type: Change.A,
      lmod: 4
    },
    {
      path: 'path1',
      type: Change.D,
      lmod: 4
    }
  ])
  t.deepEqual(cache.keys(), [
    'path2',
    'path3',
    'path4',
  ])

  t.end()
})
