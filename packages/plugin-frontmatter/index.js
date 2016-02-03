'use strict'

const Frontmatter = require('front-matter')

module.exports = function(project) { return function(files, defaults) {

  const _ = project.utils
  const options =  _.merge({
    path: function(path) { return path.setExt('html') },
    default: {}
  }, defaults)

  const collection = new project.collection('frontmatter', [ files ], options)

  function frontmatter(doc) {
    const result = Frontmatter(doc.body.toString())

    return _.merge(doc, {
      meta: _.merge(options.default, result.attributes),
      body: result.body,
    })
  }

  collection.onChange = function(create) {

    files.forEach(function(file){
      const load = file.load.then(frontmatter)
      create(file.path, load, [ file ])
    })
  }

  return collection
}}
