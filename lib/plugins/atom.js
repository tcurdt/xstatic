'use strict'

const Builder = require('xmlbuilder')

const Collection = require('../collection')
const _ = require('../utils')

module.exports = function(project) { return function(files, _options) {

  const options =  _.merge({
    sort: function(a, b) { return a.path < b.path },
    filename: 'feed.xml',
    url: project.options.url,
    title: project.options.title,
    author: project.options.author,
  }, _options)

  const collection = new Collection('atom', [ files ], options)

  function atom(docs) {

    docs.sort(options.sort)

    const feedId = _.urn(options.url) || _.throw('feed needs a url')
    const feedTitle = options.title || _.throw('feed needs a title')
    const feedSubtitle = options.subtitle
    const feedUpdated = _.formatTimestamp(files.lmod)
    const feedHref = _.pathJoin(options.url, options.filename)
    const feedRights = options.license
    const feedAuthor = options.author || _.throw('feed needs an author')

    const xml = Builder.create('feed', { 'version': '1.0', 'encoding': 'UTF-8' })
      .att('xmlns','http://www.w3.org/2005/Atom')

    xml.ele('id', feedId).up()
    xml.ele('title', feedTitle).up()
    feedSubtitle && xml.ele('subtitle', feedSubtitle).up()
    xml.ele('updated', feedUpdated).up()
    xml.ele('link')
      .att('rel', 'self')
      .att('type', 'application/atom+xml')
      .att('href', feedHref)
      .up()

    xml.ele('link').att('rel', 'alternate')
      .att('href', options.url)
      .up()

    feedAuthor && xml.ele('author').ele('name', feedAuthor).up().up()

    feedRights && xml.ele('rights', feedRights).up()

    docs.forEach(function(doc) {

      const meta = doc.meta || {}

      const entryId = _.urn(doc.path)
      const entryAuthor = meta.author || feedAuthor
      const entryTitle = meta.title || _.throw('feed item needs title')
      const entryHref = _.pathJoin(options.url, doc.path)
      const entryUpdated = _.formatTimestamp(doc.lmod)
      const entrySummary = meta.summary
      const entryContent = doc.body || _.throw('feed item has no content')

      const e = xml.ele('entry')

      e.ele('id', entryId).up()
      e.ele('title', entryTitle).up()
      e.ele('author').ele('name', entryAuthor).up().up()
      e.ele('link')
        .att('href', entryHref)
        .up()
      e.ele('updated', entryUpdated).up()

      entrySummary && e.ele('summary', entrySummary).up()

      e.ele('content', entryContent)
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
