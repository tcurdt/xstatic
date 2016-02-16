'use strict'

const _ = require('@tcurdt/tinyutils')
const Minimatch = require('minimatch')
const Path = require('path')
const Fs = require('fs')

const LazyPromise = require('./lazy')
const Change = require('./changes')
const Cache = require('./cache')

function Glob(pattern, defaults) {

  const options =  _.merge({
  }, defaults)

  const self = this

  Cache(this)

  this.inspect = function() {
    return `{glob:${pattern}, files:${self.length}, lmod:${self.lmod}}`
  }

  this.load = Promise.resolve([])

  function createPromise(changesUmatched) {

    const changes = (changesUmatched || []).filter(function(change, i) {
      return Minimatch(change.path, pattern)
    })

    const cwd = process.cwd()
    const lmod = self.maxLmod(changes)

    const changed = self.applyChanges(changes, lmod, function(change) {

      const pathRel = _.stripBasedir(options.basedir, change.path)
      const pathAbs = Path.join(cwd, change.path)
      const file = {
        path: pathRel,
        lmod: change.lmod,
        load: change.load || new LazyPromise(function(loadResolve, loadReject) {
          Fs.readFile(pathAbs, function(err, data) {
            if (err) {
              loadReject(err)
            } else {
              loadResolve({
                path: pathRel,
                lmod: change.lmod,
                body: data
              })
            }
          })
        })
      }
      return file

    })

    return Promise.resolve(changed)
  }

  function cachedPromise(changes) {
    const promise = self.promise
    if (promise && promise.changes === changes) {
      return promise
    } else {
      self.promise = createPromise(changes)
      self.promise.changes = changes
      return self.promise
    }
  }

  this.update = function(changes) {
    return cachedPromise(changes)
  }

  return this
}

module.exports = Glob
