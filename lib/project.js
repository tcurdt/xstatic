'use strict'

const BrowserSync = require('browser-sync')
const Chokidar = require('chokidar')
const Fs = require('fs')
const Path = require('path')
const Mkdirp = require('mkdirp')

const Glob = require('./glob')
const Type = require('./enum').changes
const _ = require('./utils')

function Project(target, _options) {

  this.options =  _.merge({
  }, _options)

  function output(collection, changesIn, cb) {

    console.time('changes')

    return collection.update(changesIn).then(function(changesOut) {

      return Promise.all(changesOut.map(function(change) {
        return new Promise(function(resolve, reject){

          const path = Path.join(target, change.path)

          if (change.type === Type.D) {

            Fs.unlink(path, function(err) {
              if (err) throw err

              // rm_empty_dirs(basedir(changes.path))

              console.log('# -', path)
              resolve(true)
            })

          } else {

            _.stats(path, function(stats){

              let copy = stats ? stats.mtime.getTime() !== change.lmod : false
              copy = !stats // FIXME
              copy = true // FIXME

              if (copy) {

                const file = collection.get(change.path)

                let direct = file.load.isFulfilled === false
                direct = false // FIXME

                file.load.then(function(doc){

                  Mkdirp(Path.dirname(path), function(err) {
                    if (err) throw err

                    if (direct) {
                      // create link
                    } else {
                      Fs.writeFile(path, doc.body, function(err) {
                        if(err) throw err

                        const mtime = change.lmod / 1000
                        Fs.utimes(path, mtime, mtime , function(){
                          if (stats) {
                            console.log('# >', path, 'nlmod:', change.lmod, 'olmod:', stats.mtime.getTime())
                          } else {
                            console.log('# +', path, 'nlmod:', change.lmod)
                          }
                          resolve(true)
                        })
                      })
                    }
                  })

                }).catch(function(err){
                  console.log('ERROR loading failed', err, err.stack)
                })

              } else {

                console.log('# =', path)
                resolve(false)
              }

            })
          }

        })
      })).then(function(applied) {
        return changesOut.filter(function(changes, i){ return applied[i] })
      }).then(function(applied) {
        // console.log('applied', applied)

        console.timeEnd('changes')

        if (cb && applied.length > 0) {
          // notify about what files were changed
          cb(applied.map(function(f){ return f.path }))
        }
      }).catch(function(err){
        console.log('p', err, err.stack)
      })

    })
  }

  function read(continues, cb) {

    let changes = []
    let ready = false

    Chokidar.watch('.', {
      cwd: '.',
      ignored: [ /[\/\\]\./, /node_modules/, /build/ ],
      ignoreInitial: false,
      depth: undefined,
      alwaysStat: true,
      interval: 100,
      persistent: continues,
    })
    .on('ready', function() {
      ready = true
      cb(changes)
      changes = []
    })
    .on('add', function(path, stats) {
      // console.log('S', path, stats.mtime.getTime(), Fs.statSync(path).mtime.getTime())
      changes.push({
        type: Type.A,
        path: path,
        lmod: stats.mtime.getTime(),
      })
      if (ready) {
        cb(changes)
        changes = []
      }
    })
    .on('change', function(path, stats) {
      changes.push({
        type: Type.M,
        path: path,
        lmod: stats.mtime.getTime(),
      })
      if (ready) {
        cb(changes)
        changes = []
      }
    })
    .on('unlink', function(path) {
      changes.push({
        type: Type.D,
        path: path,
        lmod: new Date().getTime()
      })
      if (ready) {
        cb(changes)
        changes = []
      }
    })
    .on('error', function(error) {
      console.log('ERROR', error)
    })
  }

  this.glob = function(pattern, options) {
    return new Glob(pattern, options)
  }

  this.plugin = function(name) {
    return require(name)(this)
  }

  this.build = function(collection) {
    return new Promise(function(resolve, reject){
      read(false, function(changes){
        resolve(output(collection, changes))
      })
    })
  }

  this.watch = function(collection, options) {

    const bs = options && options.browsersync ? BrowserSync.create() : undefined

    if (bs) {
      bs.init({
        server: target,
        port: 8080,
        open: false,
        logLevel: 'silent'
        // middleware: [app]
      })
    }

    read(true, function(changes) {
      return output(collection, changes, function(files) {
        console.log('reloading', files)
        if (bs) {
          bs.reload(files)
        }
      })
    })
  }
}

module.exports = Project
