'use strict'

const _ = require('@tcurdt/tinyutils')

const Collection = require('./collection')
const Glob = require('./glob')

function mapValues(obj, fn, ctx) {
  if (Array.isArray(obj)) {
    return obj.map(function(key, val) {
      return (typeof val === 'object')
        ? mapValues(val, fn, ctx)
        : fn.call(ctx, key, val)
    })
  } else if (typeof obj === 'object') {
    const res = {}
    // is the iteration order really deterministic?
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const val = obj[key]
        // if (typeof val === 'object') {
        //   res[key] = mapValues(val, fn, ctx)
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

module.exports.collections = function(context) {
  const collections = []
  mapValues(context, function(key, value) {
    if (value instanceof Collection || value instanceof Glob) {
      collections.push(value)
    }
  })
  return collections
}

module.exports.load = function(oldContext, cb) {

  const promises = []

  mapValues(oldContext, function(key, value) {
    if (value instanceof Collection || value instanceof Glob) {
      promises.push(value.load)
    } else if (value instanceof Promise) {
      promises.push(value)
    }
  })

  return Promise.all(promises).then(function(res) {

    let i = 0
    const newContext = mapValues(oldContext, function(key, value) {
      if (value instanceof Collection || value instanceof Glob) {
        if (cb) {
          return cb(res[i++])
        } else {
          return res[i++]
        }
      } else if (value instanceof Promise) {
        return res[i++]
      } else {
        return value
      }
    })

    return Promise.resolve(newContext)
  })
}

module.exports.renderContext = function(project, options, doc, other) {
  return _.merge(
    { site: project.options },
    options || {},
    doc.meta,
    (doc.json && { json: doc.json }) || {},
    { file: { path: doc.path, lmod: doc.lmod }},
    other || {}
  )
}
