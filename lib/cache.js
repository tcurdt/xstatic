'use strict'

const Type = require('./enum').changes
const _ = require('./utils')

function Cache(target) {

  const cache = new Map()

  function update(lmod) {
    target.lmod = lmod
    target.length = cache.size
  }

  update(undefined)

  target.del = function(path, lmod) {
    const file = cache.get(path)
    cache.delete(path)
    if (file) {
      update(lmod)
      return  _.merge(file, {
        type: Type.D,
        lmod: lmod,
      })
    } else {
      return undefined
    }
  }

  target.set = function(fileNew) {
    const fileOld = cache.get(fileNew.path)
    if (fileOld) {
      if (fileNew.lmod !== fileOld.lmod) {
        cache.set(fileNew.path, fileNew)
        update(fileNew.lmod)
        return  _.merge(fileNew, {
          type: Type.M,
        })
      } else {
        return undefined
      }
    } else {
      cache.set(fileNew.path, fileNew)
      update(fileNew.lmod)
      return  _.merge(fileNew, {
        type: Type.A,
      })
    }
  }

  target.get = function(path, lmod) {
    const file = cache.get(path)
    if (file) {
      if (lmod) {
        return file.lmod === lmod ? file : undefined
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
}

module.exports = Cache
