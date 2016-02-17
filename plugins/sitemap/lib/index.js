'use strict'

const Xstatic = require('xstatic-core')

const _ = require('@tcurdt/tinyutils')
const Builder = require('xmlbuilder')
const Moment = require('moment')
const Url = require('url')

module.exports = function(project) { return function(files, defaults) {

  const options =  _.merge({
    sort: function(a, b) { return a.path < b.path },
    filename: 'sitemap.xml',
    ignore: [ /404\.html$/i ],
    url: 'http://localhost',
    changefreq: 'weekly',
  }, defaults)

  const collection = new Xstatic.collection('sitemap', [ files ], options)

  function formatTimestamp(lmod) {
    return Moment(lmod).format('YYYY-MM-DDTHH:mm:ssZ')
  }

  function join(a,b) {
    if (a && b) {
      return Url.resolve(a,b)
    }
  }

  function sitemap(filesInSitemap) {

    const xml = Builder.create('urlset', { 'version': '1.0', 'encoding': 'UTF-8' })
      .att('xmlns','http://www.sitemaps.org/schemas/sitemap/0.9')

    filesInSitemap.sorted(options.sort).forEach(function(entry) {
      const e = xml.ele('url')

      const loc = join(options.url, entry.path)
      const lastmod = formatTimestamp(entry.lmod)
      // NOTE: for per file configuration the doc needs to be loaded first
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


  collection.build = function(create) {

    const load = Promise.resolve(sitemap(files))
    create(options.filename, load, [ files ])
  }

  return collection
}}
