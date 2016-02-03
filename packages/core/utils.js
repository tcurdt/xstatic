'use strict'

// const Crypto = require('crypto')
// const Moment = require('moment')
// const Fs = require('fs')
const LazyPromise = require('./lazy')

// module.exports.stats = function(path, cb) {
//   Fs.stat(path, function(err, stats) {
//     if (err === null) {
//       cb(stats)
//     } else if (err.code === 'ENOENT') {
//       cb(undefined)
//     } else {
//       throw err
//     }
//   })
// }

module.exports.throw = function(msg) {
  throw new Error(msg)
}

module.exports.stripBasedir = function(basedir, s) {
  if (basedir) {
    // FIXME
    return s.replace(new RegExp('^' + basedir + '/'), '')
  } else {
    return s
  }
}

// module.exports.pathJoin = function(a,b) {
//   // FIXME
//   return a + '/' + b
// }

// // f81d4fae-7dec-11d0-a765-00a0c91e6bf6
// module.exports.urn = function(s) {
//   if (s) {
//     const hash = Crypto.createHash('sha1')
//     hash.update(s)
//     const digest = hash.digest('hex')

//     return 'urn:uuid:'
//       + digest.slice(0,8) + '-'
//       + digest.slice(8,12) + '-'
//       + digest.slice(12,16) + '-'
//       + digest.slice(16,20) + '-'
//       + digest.slice(20,32)
//   } else {
//     return s
//   }
// }

// module.exports.formatTimestamp = function(lmod) {
//   return Moment(lmod).format('YYYY-MM-DDTHH:mm:ssZ')
//   // var d = new Date(lmod)
//   // var y = d.getFullYear()
//   // var m = '0' + (d.getMonth() + 1)
//   // var d = '0' + d.getDate()
//   // return y + '-' + m.slice(-2) + '-' + d.slice(-2)
// }

module.exports.max = function(values) {
  let m = undefined
  values.forEach(function(v){
    if (v !== undefined) {
      m = (m !== undefined) ? Math.max(m, v) : v
    }
  })
  return m
}

module.exports.lazyLoad = function(obj) {
  return new LazyPromise(function(resolve, reject) {
    resolve(obj)
  })
}

const merge = function() {
  const args = Array.prototype.slice.call(arguments)
  const r = {}
  args.forEach(function(arg){
    if (arg) {
      Object.keys(arg).forEach(function(key){
        r[key] = arg[key]
      })
    }
  })
  return r
}
module.exports.merge = merge

module.exports.spread = function(fn) {
  return function (values) {
    return fn.apply(null, values)
  }
}

module.exports.wrap = function(fn, before, after, target) {
  return function() {
    if(before) before.apply(target, arguments)
    const res = fn.apply(target, arguments)
    if(after) after.apply(target, arguments)
    return res
  }
}

let _objid = 1
module.exports.objectId = function(obj) {
  if (obj == null) {
    return null
  }
  if (obj._objid == null) {
    obj._objid = _objid++
  }
  return obj._objid
}

module.exports.renderContext = function(project, options, doc, other) {
  return merge(
    { site: project.options },
    options || {},
    doc.meta,
    (doc.json && { json: doc.json }) || {},
    { file: { path: doc.path, lmod: doc.lmod }},
    other || {}
  )
}
