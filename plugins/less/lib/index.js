'use strict'

const Xstatic = require('xstatic-core')

const _ = require('@tcurdt/tinyutils')
const Path = require('path')
const Less = require('less')

module.exports = function(project) { return function(files, defaults) {

  const options =  _.merge({
    path: function(path) { return path.setExt('css') },
    less: {
      // sourceMap: {
      //   sourceMapFileInline: true
      // }
    }
  }, defaults)

  const collection = new Xstatic.collection('less', [ files ], options)

  function less(file, doc, resolver) {
    return Less.render(doc.body.toString(), _.merge(options.less, {
      plugins: [ resolver ],
      filename: Path.resolve(file.path),
      relativeUrls: false,
    })).then(function(result) {
      return {
        body: result.css
      }
    })
  }

  collection.build = function(create) {

    const resolver = {
      install: function(_less, pluginManager) {
        const fm = new Less.FileManager()
        fm.loadFile = function(path, dir, loadOptions, env, cb) {
          return new Promise(function(resolve, reject){

            const pathRel = Path.join(_.stripBasedir(process.cwd(), dir), path)
            const pathAbs = Path.resolve(pathRel)

            const file = files.get(pathRel)
            if (file) {
              file.load.then(function(doc){
                try {
                  resolve({
                    contents: doc.body,
                    filename: pathAbs
                  })
                } catch(err) {
                  reject(err)
                }
              })
            } else {
              reject('could not find ' + pathAbs)
            }
          })
        }
        fm.supportsSync = false
        pluginManager.addFileManager(fm)
      }
    }

    files.forEach(function(file) {

      const load = file.load.then(function(doc) {
        return less(file, doc, resolver)
      })
      create(file.path, file.meta, load, [ file ])
    })
  }

  return collection
}}
