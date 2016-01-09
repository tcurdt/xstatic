'use strict'

const Sass = require('node-sass')
const Path = require('path')

const Collection = require('../collection')
const _ = require('../utils')

module.exports = function(project) { return function(files, options) {

  options =  _.merge({
    path: function(path) { return path.setExt('css') },
    sass: {
    }
  }, options)

  const collection = new Collection('sass', [ files ], options)

  function sass(file, doc) {
    const pathParent = Path.resolve(file.path)
    return new Promise(function(resolve, reject) {

      Sass.render( _.merge(options.sass, {
        data: doc.body.toString(),
        importer: function(argument, parent, done) {

          if (parent === 'stdin') {
            parent = pathParent
          }

          const p = Path.join(_.removeBasedir(process.cwd(), Path.dirname(parent)), argument)
          const dir = Path.dirname(p)
          const file = Path.basename(p)

          const paths = [
            Path.join(dir, file),
            Path.join(dir, file + '.scss'),
            Path.join(dir, '_' + file),
            Path.join(dir, '_' + file + '.scss'),
          ]
          const found = paths.map(function(pathRel){
            return files.get(pathRel)
          })
          const i = found.findIndex(function(file){ return file !== undefined })
          if (i >= 0) {
            const file = found[i]
            const pathRel = paths[i]
            const pathAbs = Path.resolve(pathRel)

            file.load.then(function(doc) {
              try {

                done({
                  file: pathAbs,
                  contents: doc.body.toString()
                })

              } catch(err) {
                console.log(err)
                done({})
              }
            })
          } else {
            console.log("could not find " + p)
            done({})
          }

        }
      }), function(err, result) {
        if (err) {
          console.log("ERR", err)
          reject(err)
        } else {
          resolve({
            body: result.css.toString()
          })
        }
      })

    })
  }


  collection.onChange = function(create) {

    files.forEach(function(file){

      const base = Path.basename(file.path)
      if (base[0] !== '_') {
        create(file.path, file.load.then(function(doc) {
          return sass(file, doc)
        }), [ file ])
      }

    })
  }

  return collection
}}
