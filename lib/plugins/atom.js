'use strict'

const Builder = require('xmlbuilder')

const Collection = require('../collection')
const _ = require('../utils')

module.exports = function(project) { return function(files, options) {

  options =  _.merge({
    sort: function(a, b) { return a.path < b.path },
    filename: 'feed.xml',
    url: project.options.url,
    title: project.options.title,
    author: project.options.author,
  }, options)

  const collection = new Collection('atom', [ files ], options)

  function atom(docs) {

    docs.sort(options.sort)

    const id = _.urn(options.url) || _.throw('feed needs a url')
    const title = options.title || _.throw('feed needs a title')
    const subtitle = options.subtitle
    const updated = _.formatTimestamp(files.lmod)
    const href = _.pathJoin(options.url, options.filename)
    const rights = options.license
    const author = options.author || _.throw('feed needs an author')

    const xml = Builder.create('feed', { 'version': '1.0', 'encoding': 'UTF-8' })
      .att('xmlns','http://www.w3.org/2005/Atom')

    xml.ele('id', id).up()
    xml.ele('title', title).up()
    subtitle && xml.ele('subtitle', subtitle).up()
    xml.ele('updated', updated).up()
    xml.ele('link')
      .att('rel', 'self')
      .att('type', 'application/atom+xml')
      .att('href', href)
      .up()

    xml.ele('link').att('rel', 'alternate')
      .att('href', options.url)
      .up()

    author && xml.ele('author').ele('name', author).up().up()

    rights && xml.ele('rights', rights).up()

    docs.forEach(function(doc){

      const meta = doc.meta || {}

      const id = _.urn(doc.path)
      const author = meta.author || options.author || _.throw('feed or feed item needs author')
      const title = meta.title || _.throw('feed item needs title')
      const href = _.pathJoin(options.url, doc.path)
      const updated = _.formatTimestamp(doc.lmod)
      const summary = meta.summary
      const content = doc.body || _.throw('feed item has no content')

      const e = xml.ele('entry')

      e.ele('id', id).up()
      e.ele('title', title).up()
      e.ele('author').ele('name', author).up().up()
      e.ele('link')
        .att('href', href)
        .up()
      e.ele('updated', updated).up()

      summary && e.ele('summary', summary).up()

      e.ele('content', content)
        .att('type', 'html')
        .up()
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

    const load = files.load.then(atom)

    create(options.filename, load, [ files ])

  }

  return collection
}}
