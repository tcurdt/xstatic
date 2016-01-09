"use strict"

module.exports = function(project) {

  const Merge = require('./merge')(project)
  const Filter = require('./filter')(project)
  const Less = require('./less')(project)
  const Sass = require('./sass')(project)
  // const Styl = require('./stylus')(project)

  return function(files, options) {

    const css = Filter('**/*.css', [ files ])
    const less = Less(Filter('**/*.less', [ files ]))
    const sass = Sass(Filter('**/*.+(sass|scss)', [ files ]))
    // const styl = Styl(Filter('**/*.styl', [ files ]))

   return Merge([ css, less, sass ])
  }
}