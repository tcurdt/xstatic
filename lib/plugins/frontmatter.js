'use strict'

const Frontmatter = require('front-matter')

const Collection = require('../collection')
const _ = require('../utils')

module.exports = function(project) { return function(files, options) {

  options =  _.merge({
    path: function(path) { return path.setExt('html') },
    default: {}
  }, options)

  const collection = new Collection('frontmatter', [ files ], options)

  function frontmatter(doc) {
    const result = Frontmatter(doc.body.toString())
    return {
      meta:  _.merge(options.default, result.attributes),
      body: result.body,
    }
  }

  collection.onChange = function(create) {

    files.forEach(function(file){

      const load = file.load.then(frontmatter)

      create(file.path, load, [ file ])

    })
  }

  return collection
}}
