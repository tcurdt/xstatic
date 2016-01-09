'use strict'

const Minimatch = require('minimatch')
const Promise = require('bluebird')
const Path = require('path')
const Fs = require('fs')

const LazyPromise = require('./lazy')
const Cache = require('./cache')
const Type = require('./enum').changes
const _ = require('./utils')

function Glob(pattern, options) {

  options =  _.merge({
  }, options)

  const self = this

  Cache(this)

  this.inspect = function() {
    return '{glob:' + pattern + ', files:' + self.length + ', lmod:' + self.lmod + '}'
  }

  function createPromise(changesUmatched) {

    const changes = (changesUmatched || []).filter(function(change, i) {
      return Minimatch(change.path, pattern)
    })

    return new Promise(function(resolve) {

      const changesOut = []

      function out(what) {
        if (what) changesOut.push(what)
      }

      const cwd = process.cwd()

      changes.forEach(function(change) {
        const pathRel = _.removeBasedir(options.basedir, change.path)
        const pathAbs = Path.join(cwd, change.path)

        if (change.type === Type.D) {

          out(self.del(pathRel, change.lmod))

        } else {

          const file = {
            path: pathRel,
            lmod: change.lmod,
            load: change.load || new LazyPromise(function(resolve, reject) {
              Fs.readFile(pathAbs, function(err, data) {
                if (err) {
                  reject(err)
                } else {
                  resolve({
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

      self.load = new LazyPromise(function(resolve, reject) {
        Promise.all(self.map(function(file){ return file.load })).then(function(docs){
          resolve(docs)
        })
      })

      resolve(changesOut)
    })
  }

  function cached(changes) {
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
    return cached(changes)
  }

  return this
}

module.exports = Glob
