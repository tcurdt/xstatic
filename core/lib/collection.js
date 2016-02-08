'use strict'

const _ = require('@tcurdt/tinyutils')
const FilePath = require('@tcurdt/filepath')

const LazyPromise = require('./lazy')
const Cache = require('./cache')

function Collection(name, inputs, defaults) {

  Array.isArray(inputs) || _.throw(`inputs to "${name}" needs to be an array`)

  const options =  _.merge({
    path: function(path) { return path }
  }, defaults)

  const self = this

  Cache(this)

  this.inspect = function() {
    return `{collection:${name}, files:${self.length}, lmod:${self.lmod}}`
  }

  this.load = Promise.resolve([])

  function updateDependencies(changes) {
    return Promise.all(inputs.map(function(input) {
      return input.update(changes || [])
    })).then(function(results) {
      return [].concat.apply([], results)
    })
  }

  function updatedCache(upstreamChanges) {

    if (upstreamChanges.length === 0) {
      return Promise.resolve([])
    }

    const changesOut = []

    function out(what) {
      if (what) {
        changesOut.push(what)
      }
    }

    const removed = new Set(self.keys())

    return Promise.resolve(self.onChange(function(path, load, dependencies) {

      const filePath = options.path(new FilePath(path)).toString()
      const fileLmod = _.max(dependencies.map(function(input) { return input.lmod }))

      const file = {
        path: filePath,
        lmod: fileLmod,
        load: new LazyPromise(function(resolve, reject) {
          load.then(function(doc) {
            const d = _.merge(doc, {
              path: filePath,
              lmod: fileLmod,
            })
            resolve(d)
          }).catch(function(err) {
            reject(err)
          })
        })
      }

      out(self.set(file))

      removed.delete(filePath)

    })).then(function() {

      const depsLmod = _.max(inputs.map(function(input) { return input.lmod }))
      removed.forEach(function(path) {
        out(self.del(path, depsLmod))
      })

      self.load = new LazyPromise(function(resolve, reject) {
        Promise.all(self.map(function(file){ return file.load })).then(function(docs) {
          resolve(docs)
        })
      })

      return Promise.resolve(changesOut)
    })
  }

  function createPromise(changes) {
    return updateDependencies(changes).then(updatedCache)
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

module.exports = Collection
