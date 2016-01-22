'use strict'

const BrowserSync = require('browser-sync')
const Chokidar = require('chokidar')
const Fs = require('fs')
const Path = require('path')
const Mkdirp = require('mkdirp')

const Glob = require('./glob')
const Type = require('./enum').changes
const _ = require('./utils')

const ONCE = false
const CONTINOUSLY = true

function Project(target, _options) {

  this.options =  _.merge({
  }, _options)

  function fileLink(change, stats, cb) {
    // const cwd = process.cwd()
    // const src = Path.join(cwd, change.path)
    const dst = Path.join(target, change.path)
    Fs.link(change.orig, dst, function(err) {
      if (err) {
        cb(err)
      } else {
        console.log('# ~', dst, 'nlmod:', change.lmod, 'olmod:', stats.mtime.getTime())
        cb(null, true)
      }
    })
  }

  function fileWrite(change, stats, doc, cb) {
    // const cwd = process.cwd()
    // const src = Path.join(cwd, change.path)
    const dst = Path.join(target, change.path)
    Fs.writeFile(dst, doc.body, function(err) {
      if(err) {
        cb(err)
      } else {
        const mtime = change.lmod / 1000
        Fs.utimes(dst, mtime, mtime , function() {

          if (stats) {
            console.log('# >', dst, 'nlmod:', change.lmod, 'olmod:', stats.mtime.getTime())
          } else {
            console.log('# +', dst, 'nlmod:', change.lmod)
          }

          cb(null, true)
        })
      }
    })
  }

  function modifyChange(change, collection) {
    return new Promise(function(resolve, reject) {
      // const cwd = process.cwd()
      // const src = Path.join(cwd, change.path)
      const dst = Path.join(target, change.path)
      _.stats(dst, function(stats) {

        const unmodified = stats && stats.mtime.getTime() === change.lmod

        if (unmodified) {

          console.log('# =', dst)
          resolve(false)

        } else {

          const file = collection.get(change.path)
          // const link = file.load.isFulfilled === false
          const link = false

          file.load.then(function(doc) {

            Mkdirp(Path.dirname(dst), function(dirErr) {
              if (dirErr) throw dirErr

              if (link) {

                fileLink(change, stats, function(linkErr, res) {
                  if (linkErr) throw linkErr
                  resolve(res)
                })

              } else {

                fileWrite(change, stats, doc, function(writeErr, res) {
                  if (writeErr) throw writeErr
                  resolve(res)
                })

              }
            })

          }).catch(function(err){
            console.error('error output', err, err.stack)
            reject(err)
          })

        }
      })
    })
  }

  function deleteChange(change, collection) {
    return new Promise(function(resolve, reject) {
      // const cwd = process.cwd()
      // const src = Path.join(cwd, change.path)
      const dst = Path.join(target, change.path)
      Fs.unlink(dst, function(err) {
        if(err) {
          reject(err)
        } else {
          // rm_empty_dirs(basedir(changes.path))
          console.log('# -', dst)
          resolve(true)
        }
      })
    })
  }

  function applyChange(change, collection) {
    if (change.type === Type.D) {
      return deleteChange(change, collection)
    } else {
      return modifyChange(change, collection)
    }
  }

  function updateCollection(collection, changesIn, cb) {

    console.time('changes')

    return collection.update(changesIn).then(function(changesOut) {
      return Promise.all(changesOut.map(function(change) { return applyChange(change, collection) })).then(function(applied) {
        return changesOut.filter(function(changes, i) { return applied[i] })
      }).then(function(applied) {

        console.timeEnd('changes')

        if (cb && applied.length > 0) {
          // notify about what files were changed
          cb(applied.map(function(f) { return f.path }))
        }

      }).catch(function(err){

        console.timeEnd('changes')

        console.error('error', err, err.stack)
      })
    })
  }

  function watch(continues, cb) {

    let changes = []
    let ready = false

    function update() {
      if (ready) {
        try {
          cb(changes)
          changes = []
        } catch(err) {
          console.error('update failed', err, err.stack)
        }
      }
    }

    Chokidar.watch('.', {
      cwd: '.',
      ignored: [ /[\/\\]\./, /node_modules/, /build/ ],
      ignoreInitial: false,
      depth: undefined,
      alwaysStat: true,
      interval: 100,
      persistent: continues,
    }).on('ready', function() {
      ready = true
      update()
    }).on('add', function(path, stats) {
      changes.push({
        type: Type.A,
        path: path,
        lmod: stats.mtime.getTime(),
      })
      update()
    }).on('change', function(path, stats) {
      changes.push({
        type: Type.M,
        path: path,
        lmod: stats.mtime.getTime(),
      })
      update()
    }).on('unlink', function(path) {
      changes.push({
        type: Type.D,
        path: path,
        lmod: new Date().getTime()
      })
      update()
    }).on('error', function(err) {
      console.error('error', err, err.stack)
    })
  }

  this.glob = function(pattern, options) {
    return new Glob(pattern, options)
  }

  // this.plugin = function(name) {
  //   return require(name)(this)
  // }

  this.build = function(collection) {
    return new Promise(function(resolve){
      watch(ONCE, function(changes) {
        resolve(updateCollection(collection, changes))
      })
    })
  }

  this.watch = function(collection, options) {

    const bs = options && options.browsersync ? BrowserSync.create() : null

    if (bs) {
      bs.init({
        server: target,
        port: 8080,
        open: false,
        logLevel: 'silent'
        // middleware: [app]
      })
      console.log('listening on port 8080')
    }

    watch(CONTINOUSLY, function(changes) {
      return updateCollection(collection, changes, function(files) {
        console.log('reloading', files)
        if (bs) {
          bs.reload(files)
        }
      })
    })
  }
}

module.exports = Project
