'use strict'

const Test = require('blue-tape')
const Xstatic = require('../lib')
const Lazy = require('../lib/lazy')
const Change = require('../lib/changes')
const Cache = require('../lib/cache')


function safe(o) {
  return o || {}
}

Test('test', function(t) {

  const cache = new Cache({})

  cache.set({
    path: 'path',
    lmod: 0
  })

  const r = safe(cache.get('path', 0))
  t.equal(r.path, 'path')
  t.equal(r.lmod, 0)

  t.end()
})
