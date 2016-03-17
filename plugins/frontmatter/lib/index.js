'use strict'

const Xstatic = require('xstatic-core')
const _ = require('@tcurdt/tinyutils')

const Frontmatter = require('front-matter')

module.exports = function(project) { return function(files, defaults) {

  const options =  _.merge({
    path: function(path) { return path.setExt('html') },
    default: {}
  }, defaults)

  const collection = new Xstatic.collection('frontmatter', [ files ], options)

  function frontmatter(doc) {
    const result = Frontmatter(doc.body.data.toString())

    return _.merge(doc, {
      meta: _.merge(options.default, result.attributes),
      body: {
        mime: "text/any",
        data: result.body
      }
    })
  }

  collection.build = function(create) {
    return _.collect(function(add) {

      files.forEach(function(file) {
        add(create(_.merge(file, {
          path: file.path,
          load: file.load.then(frontmatter),
        }), [ file ]))
      })
    })
  }

  return collection
}}
