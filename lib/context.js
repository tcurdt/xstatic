'use strict'

const Collection = require('./collection')
const Glob = require('./glob')

function mapDeep(obj, fn, ctx) {
  if (Array.isArray(obj)) {
    return obj.map(function(key, val) {
      return (typeof val === 'object') ? mapDeep(val, fn, ctx) : fn.call(ctx, key, val)
    })
  } else if (typeof obj === 'object') {
    const res = {}
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        const val = obj[key]
        // if (typeof val === 'object') {
        //   res[key] = mapDeep(val, fn, ctx)
        // } else {
          res[key] = fn.call(ctx, key, val)
        // }
      }
    }
    return res
  } else {
    return obj
  }
}

module.exports.load = function(oldContext) {

  const promises = []

  mapDeep(oldContext, function(key, value) {
    if (value instanceof Collection || value instanceof Glob) {
      promises.push(value.load)
    } else if (value instanceof Promise) {
      promises.push(value)
    }
    return value
  })

  return Promise.all(promises).then(function(res) {

    var i = 0
    const newContext = mapDeep(oldContext, function(key, value) {
      if (value instanceof Collection || value instanceof Glob) {
        return res[i++]
      } else if (value instanceof Promise) {
        return res[i++]
      }
    })

    return Promise.resolve(newContext)
  })
}
