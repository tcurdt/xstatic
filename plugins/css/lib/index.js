'use strict'

module.exports = function(project) {

  const Filter = require('@xstatic/filter')(project)
  const Merge = require('@xstatic/merge')(project)
  const Less = require('@xstatic/less')(project)
  const Sass = require('@xstatic/sass')(project)
  // const Styl = require('@xstatic/stylus')(project)

  return function(files, options) {

    const css = Filter('**/*.css', [ files ])
    const less = Less(Filter('**/*.less', [ files ]))
    const sass = Sass(Filter('**/*.+(sass|scss)', [ files ]))
    // const styl = Styl(Filter('**/*.styl', [ files ]))

   return Merge([ css, less, sass ])
  }
}