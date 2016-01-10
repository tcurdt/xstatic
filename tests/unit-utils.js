'use strict'

const Test = require('blue-tape')

const _ = require('../lib/utils')

Test('max should give the max of numbers', function(t) {
  t.equal(_.max([ 3, 1, 2 ]), 3)
  t.end()
})

Test('max should give a number if numbers and undefined', function(t) {
  t.equal(_.max([ 3, 1, undefined ]), 3)
  t.end()
})

Test('max should give undefined if all undefined', function(t) {
  t.equal(_.max([ undefined, undefined, undefined ]), undefined)
  t.end()
})

Test('throw should throw an error', function(t) {
  t.throws(function(){
    _.throw('error')
  })
  t.end()
})

Test('lazyLoad should create a lazy promise', function(t) {
  const l = _.lazyLoad({ body: 'text' })
  t.false(l.isFulfilled)
  t.end()
})

Test('merge should respect the order when merging', function(t) {

  const m = _.merge(
    { a:1, b: 1},
    { a:2, c: 2},
    { a:3, d: 3})

  t.equal(m.a, 3)
  t.equal(m.b, 1)
  t.equal(m.c, 2)
  t.equal(m.d, 3)

  t.end()
})

Test('wrapping function', function(t) {

  const order = []
  const fn = _.wrap(function(){
    order.push(2)
  }, function(){
    order.push(1)
  }, function(){
    order.push(3)
  })

  fn()

  t.deepEqual(order, [1,2,3])

  t.end()
})
