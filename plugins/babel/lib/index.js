'use strict'

const Xstatic = require('xstatic-core')

const _ = require('@tcurdt/tinyutils')
const Babel = require('babel-core')

module.exports = function(project) { return function(files, defaults) {

  const options =  _.merge({
    path: function(path) { return path.setExt('js') },
    babel: {
      // sourceMaps: true,
      // stage: 2,
      // compact: false,
      // presets: [],
      plugins: [ 'transform-react-jsx' ]
    }
  }, defaults)

  const collection = new Xstatic.collection('babel', [ files ], options)

  function babel(doc) {
    return Babel.transform(doc.body.data, _.merge({
      // filename: doc.path,
      ast: false,
    }, options.babel))
  }

  function returnCode(result) {
    return {
      body: {
        mime: "text/javascript",
        data: result.code
      }
    }
  }

  function returnMap(result) {
    return {
      body: {
        mime: "text/json",
        data: JSON.stringify(result.map)
      }
    }
  }

  collection.build = function(create) {

    files.forEach(function(file) {
      const compile = file.load.then(babel)
      create({
        path: file.path,
        load: compile.then(returnCode),
      }, [ file ])
      // create({
      //   path: file.path + '.map',
      //   load: compile.then(returnMap),
      // }, [ file ])
    })
  }

  return collection
}}
