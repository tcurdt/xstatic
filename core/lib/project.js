'use strict'

const _ = require('@tcurdt/tinyutils')
const BrowserSync = require('browser-sync')
const Chokidar = require('chokidar')
const Fs = require('fs')
const Path = require('path')
const Mkdirp = require('mkdirp')

const Glob = require('./glob')
const Type = require('./changes')

const ONCE = false
const CONTINOUSLY = true

function Project(target, defaults) {

  this.options =  _.merge({
  }, defaults)

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
    Fs.writeFile(dst, doc.body.data, function(err) {
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

  function stats(path, cb) {
    Fs.stat(path, function(err, stats) {
      if (err === null) {
        cb(stats)
      } else if (err.code === 'ENOENT') {
        cb(undefined)
      } else {
        throw err
      }
    })
  }

  function modifyChange(change, collection) {
    return new Promise(function(resolve, reject) {
      // const cwd = process.cwd()
      // const src = Path.join(cwd, change.path)
      const dst = Path.join(target, change.path)
      stats(dst, function(stats) {

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

          }).catch(function(err) {
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
          console.error('ERROR2', err, err.stack)
        }
      }
    }

    const ignoresPath = '.xstaticignore'
    const ignoresLines = Fs.existsSync(ignoresPath)
      ? [ '^\.\w+', 'node_modules', target ].concat(Fs.readFileSync(ignoresPath).toString().split("\n"))
      : [ '^\.\w+', 'node_modules', target ]
    const ignoresRegex = ignoresLines.map(function(line) { return new RegExp(line) })

    Chokidar.watch('.', {
      cwd: '.',
      ignored: ignoresRegex,
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
      console.error('ERROR3', err, err.stack)
    })
  }

  this.glob = function(pattern, options) {
    return new Glob(pattern, options)
  }

  // FIMXE maybe add full cmd parsing https://github.com/bcoe/yargs
  this.process = function(collection, options) {
    if(process.argv.indexOf("-w") != -1){
      return this.watch(collection, options)
    } else {
      return this.build(collection)
    }
  }

  this.build = function(collection) {
    return new Promise(function(resolve, reject){
      watch(ONCE, function(changes) {
        updateCollection(collection, changes).then(function(results) {
          resolve(results)
        }).catch(function(err) {
          console.error('ERROR4', err, err.stack)
          reject(err)
        })
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
      }).catch(function(err) {

        bs.notify(err.message, 5000)
        console.error('ERROR5', err, err.stack)
      })
    })

    return Promise.resolve()
  }
}

module.exports = Project
