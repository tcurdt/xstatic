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

  function babel(file) {
    return Babel.transform(file.body, _.merge({
      // filename: file.path,
      ast: false,
    }, options.babel))
  }

  function returnCode(result) {
    return {
      body: result.code
    }
  }

  function returnMap(result) {
    return {
      body: JSON.stringify(result.map)
    }
  }

  collection.onChange = function(create) {

    files.forEach(function(file){
      const compile = file.load.then(babel)
      create(file.path, compile.then(returnCode), [ file ])
      // create(file.path + '.map', compile.then(returnMap), [ file ])
    })
  }

  return collection
}}
