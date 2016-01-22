'use strict'

const _ = require('./utils')

function LazyPromise(fn) {

  const self = this
  let promise = null

  this.isFulfilled = false

  this.then = function() {
    promise = promise || new Promise(fn)
    self.isFulfilled = promise != null
    return promise.then.apply(promise, arguments)
  }

  this.inspect = function() {
    return `{LazyPromise(${_.objectId(this)}):${this.isFulfilled}}`
  }
}

module.exports = LazyPromise