'use strict'

const Builder = require('xmlbuilder')
const Crypto = require('crypto')
const Moment = require('moment')
const Url = require('url')

module.exports = function(project) { return function(files, _options) {

  const _ = project.utils

  const options =  _.merge({
    sort: function(a, b) { return a.path < b.path },
    filename: 'feed.xml',
    url: project.options.url,
    title: project.options.title,
    author: project.options.author,
  }, _options)

  const collection = new project.collection('atom', [ files ], options)

  // urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6
  function urn(s) {
    if (s) {
      const hash = Crypto.createHash('sha1')
      hash.update(s)
      const digest = hash.digest('hex')
      return 'urn:uuid:'
        + digest.slice(0,8) + '-'
        + digest.slice(8,12) + '-'
        + digest.slice(12,16) + '-'
        + digest.slice(16,20) + '-'
        + digest.slice(20,32)
    }
  }

  function formatTimestamp(lmod) {
    return Moment(lmod).format('YYYY-MM-DDTHH:mm:ssZ')
  }

  function join(a,b) {
    if (a && b) {
      return Url.resolve(a,b)
    }
  }

  function atom(docs) {

    docs.sort(options.sort)

    const feedId = urn(options.url) || _.throw('feed needs a url')
    const feedTitle = options.title || _.throw('feed needs a title')
    const feedSubtitle = options.subtitle
    const feedUpdated = formatTimestamp(files.lmod)
    const feedHref = join(options.url, options.filename)
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

      const entryId = urn(doc.path)
      const entryAuthor = meta.author || feedAuthor
      const entryTitle = meta.title || _.throw('feed item needs title')
      const entryHref = join(options.url, doc.path) || _.throw('invalid href for doc ' + JSON.stringify(doc))
      const entryUpdated = formatTimestamp(doc.lmod)
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
