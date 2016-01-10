'use strict'

const Test = require('blue-tape')

const LazyPromise = require('../lib/lazy')

Test('should be fulfilled only after "then" was called', function(t) {
  const l = new LazyPromise(function(resolve) { resolve(true) })
  t.false(l.isFulfilled, 'not fulfilled')
  return l.then(function(resolve){
    t.true(l.isFulfilled, 'fulfilled')
  })
})
