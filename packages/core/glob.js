'use strict'

const Minimatch = require('minimatch')
const Path = require('path')
const Fs = require('fs')

const LazyPromise = require('./lazy')
const Cache = require('./cache')
const Type = require('./enum').changes
const _ = require('./utils')

function Glob(pattern, defaults) {

  const options =  _.merge({
  }, defaults)

  const self = this

  Cache(this)

  this.inspect = function() {
    return `{glob:${pattern}, files:${self.length}, lmod:${self.lmod}}`
  }

  function createPromise(changesUmatched) {

    const changes = (changesUmatched || []).filter(function(change, i) {
      return Minimatch(change.path, pattern)
    })

    return new Promise(function(resolve) {

      const changesOut = []

      function out(what) {
        if (what) {
          changesOut.push(what)
        }
      }

      const cwd = process.cwd()

      changes.forEach(function(change) {
        const pathRel = _.stripBasedir(options.basedir, change.path)
        const pathAbs = Path.join(cwd, change.path)

        if (change.type === Type.D) {

          out(self.del(pathRel, change.lmod))

        } else {

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

          out(self.set(file))
        }
      })

      self.load = new LazyPromise(function(resolveLoad, reject) {
        Promise.all(self.map(function(file){ return file.load })).then(function(docs){
          resolveLoad(docs)
        })
      })

      resolve(changesOut)
    })
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
