'use strict'

const _ = require('@tcurdt/tinyutils')
const LazyPromise = require('./lazy')

const Change = require('./changes')

function Cache(target) {

  let cache = new Map()

  target.maxLmod = function(collections) {
    return _.max(collections.map(function(input) { return input.lmod }))
  }

  update(undefined)

  function update(lmod) {
    target.lmod = lmod
    target.length = cache.size
    target.load = new LazyPromise(function(resolve, reject) {
      Promise.all(target.map(function(file){ return file.load })).then(function(docs) {
        resolve(docs)
      })
    })
  }

  target.applyChanges = function(changes, lmod, cb) {

    const changed = []
    const cacheNew = new Map(cache)

    changes.forEach(function(change) {
      const fileOld = cache.get(change.path)
      if (change.type === Change.D) {
        if (fileOld) {
          cacheNew.delete(change.path)
          changed.push(_.merge(fileOld, {
            type: Change.D,
            lmod: lmod,
          }))
        }
      } else {
        const fileNew = cb(change)
        cacheNew.set(fileNew.path, fileNew)
        if (fileOld) {
          if (fileNew.lmod !== fileOld.lmod) {
            changed.push(_.merge(fileNew, {
              type: Change.M,
            }))
          } else {
            // no change
          }
        } else {
          changed.push(_.merge(fileNew, {
            type: Change.A,
          }))
        }
      }
    })

    cache = cacheNew

    if (changed.length) {
      update(lmod)
    }

    return changed
  }

  target.applyFiles = function(files, lmod) {

    const changed = []
    const cacheNew = new Map()

    const remaining = new Set(cache.keys())
    files.forEach(function(fileNew) {
      const fileOld = cache.get(fileNew.path)
      cacheNew.set(fileNew.path, fileNew)
      if (fileOld) {
        if (fileNew.lmod !== fileOld.lmod) {
          changed.push(_.merge(fileNew, {
            type: Change.M,
          }))
        } else {
          // no change
        }
      } else {
        changed.push(_.merge(fileNew, {
          type: Change.A,
        }))
      }
      remaining.delete(fileNew.path)
    })
    remaining.forEach(function(path) {
      const fileOld = cache.get(path)
      if (fileOld) {
        changed.push(_.merge(fileOld, {
          type: Change.D,
          lmod: lmod,
        }))
      } else {
        // no such file
      }
    })

    cache = cacheNew

    update(lmod)

    return changed
  }

  target.get = function(path, lmod) {
    const file = cache.get(path)
    if (file) {
      if (lmod) {
        if (file.lmod === lmod) {
          return file
        } else {
          return undefined
        }
      } else {
        return file
      }
    } else {
      return undefined
    }
  }

  target.map = function(cb) {
    const files = Array.from(cache.values())
    return files.map(cb)
  }

  target.forEach = function(cb) {
    const files = Array.from(cache.values())
    return files.forEach(cb)
  }

  target.sorted = function(fn) {
    const files = Array.from(cache.values())
    files.sort(fn)
    return files
  }

  target.keys = function() {
    return Array.from(cache.keys())
  }

  target.values = function() {
    return Array.from(cache.values())
  }

  return target
}

module.exports = Cache
