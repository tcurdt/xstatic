'use strict'

const Xstatic = require('xstatic-core')

const _ = require('@tcurdt/tinyutils')
const Sass = require('node-sass')

const Path = require('path')

module.exports = function(project) { return function(files, defaults) {

  const options =  _.merge({
    path: function(path) { return path.setExt('css') },
    sass: {
    }
  }, defaults)

  const collection = new Xstatic.collection('sass', [ files ], options)

  function sass(doc) {
    const pathParent = Path.resolve(doc.path)
    return new Promise(function(resolve, reject) {

      Sass.render( _.merge(options.sass, {
        data: doc.body.data.toString(),
        functions: {
          'env($name)': function(name) {
            const value = process.env[name.getValue()]
            return new Sass.types.String(value)
          }
        },
        importer: function(argument, _parent, done) {

          const parent = (_parent === 'stdin') ? pathParent : _parent

          const p = Path.join(_.stripBasedir(process.cwd(), Path.dirname(parent)), argument)
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
          const i = found.findIndex(function(foundFile){ return foundFile !== undefined })
          if (i >= 0) {
            const foundFile = found[i]
            const pathRel = paths[i]
            const pathAbs = Path.resolve(pathRel)

            foundFile.load.then(function(foundDoc) {
              try {

                done({
                  file: pathAbs,
                  contents: foundDoc.body.data.toString()
                })

              } catch(err) {
                console.log(err)
                done({})
              }
            })
          } else {
            console.log('could not find ' + p)
            done({})
          }

        }
      }), function(err, result) {
        if (err) {
          reject(err)
        } else {
          resolve({
            body: {
              mime: "text/css",
              data: result.css.toString()
            }
          })
        }
      })

    })
  }


  collection.build = function(create) {

    files.forEach(function(file){

      const base = Path.basename(file.path)
      // sass files starting with '_' are includes that
      // should not produce an output file
      if (base[0] !== '_') {
        create({
          path: file.path,
          load: file.load.then(sass),
        }, [ file ])
      }
    })
  }

  return collection
}}
