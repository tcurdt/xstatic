'use strict'

const Less = require('less')
const Path = require('path')

const Collection = require('../collection')
const _ = require('../utils')

module.exports = function(project) { return function(files, _options) {

  const options =  _.merge({
    path: function(path) { return path.setExt('css') },
    less: {
      // sourceMap: {
      //   sourceMapFileInline: true
      // }
    }
  }, _options)

  const collection = new Collection('less', [ files ], options)

  function less(file, content, resolver) {
    return Less.render(content.body.toString(), _.merge(options.less, {
      plugins: [ resolver ],
      filename: Path.resolve(file.path),
      relativeUrls: false,
    })).then(function(result) {
      return {
        body: result.css
      }
    })
  }

  collection.onChange = function(create) {

    const resolver = {
      install: function(_less, pluginManager) {
        const fm = new Less.FileManager()
        fm.loadFile = function(path, dir, loadOptions, env, cb) {
          return new Promise(function(resolve, reject){

            const pathRel = Path.join(_.removeBasedir(process.cwd(), dir), path)
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

    files.forEach(function(file){

      create(file.path, file.load.then(function(content) {
        return less(file, content, resolver)
      }), [ file ])

    })
  }

  return collection
}}
