'use strict'

const Builder = require('xmlbuilder')

const _ = require('../../utils')

module.exports = function(project) { return function(files, _options) {

  const options =  _.merge({
    sort: function(a, b) { return a.path < b.path },
    filename: 'sitemap.xml',
    ignore: [ /404\.html$/i ],
    url: 'http://localhost',
    changefreq: 'weekly',
  }, _options)

  const collection = new project.collection('sitemap', [ files ], options)

  function sitemap(filesInSitemap) {

    const xml = Builder.create('urlset', { 'version': '1.0', 'encoding': 'UTF-8' })
      .att('xmlns','http://www.sitemaps.org/schemas/sitemap/0.9')

    filesInSitemap.sorted(options.sort).forEach(function(entry) {
      const e = xml.ele('url')

      const loc = _.pathJoin(options.url, entry.path)
      const lastmod = _.formatTimestamp(entry.lmod)
      // NOTE: for per file configuration the doc needs to be loaded
      const changefreq = options.changefreq
      // const priority = 0.5

      e.ele('loc', loc).up()
      e.ele('lastmod', lastmod).up()
      e.ele('changefreq', changefreq).up()
      // e.ele('priority', priority).up()
    })

    return {
      body: xml.end({
        pretty: true,
        indent: '  ',
        newline: '\n'
      })
    }
  }


  collection.onChange = function(create) {

    const load = Promise.resolve(sitemap(files))

    create(options.filename, load, [ files ])

  }

  return collection
}}
