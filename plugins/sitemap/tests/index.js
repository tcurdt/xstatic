'use strict'

const Test = require('blue-tape')
const Xstatic = require('xstatic-core')
const Change = Xstatic.changes
const Lazy = Xstatic.lazy

const Fs = require('fs')
const Libxml = require('libxmljs')

function setup(t, cb) {
  const project = new Xstatic('build')
  const files = project.glob('content/**/*.txt')
  const plugin = require('../lib')(project)
  const collection = plugin(files)

  return cb(project, collection)
}

function update(file, doc) {
  file.load = Lazy.load(doc)
  doc.file = file
  return file
}

Test('creates sitemap of all files', function(t) {
  return setup(t, function(project, collection) {

    const changesIn = [

      update({
        type: Change.A,
        lmod: 1445556599000,
        path: 'content/posts/2014/slug1/index.txt',
      }, {
        body: { data: 'post1' }
      }),
      update({
        type: Change.A,
        lmod: 1445556599000,
        path: 'content/posts/2015/slug1/index.txt',
      }, {
        body: { data: 'post2' }
      }),

    ]

    return collection.update(changesIn).then(function(changesOut){

      t.equal(collection.length, 1, 'has output')

      const file = collection.get('sitemap.xml')

      t.ok(file, 'exits')

      return file.load.then(function(doc) {

        changesIn.forEach(function(change) {
          t.ok(!change.load.isFulfilled, change.path + ' not loaded')
        })

        t.doesNotThrow(function() {

          const path = __dirname + '/sitemap.xsd'
          const xsd = Fs.readFileSync(path).toString()
          const xsdDoc = Libxml.parseXml(xsd)
          const xmlDoc = Libxml.parseXml(doc.body.data)
          const valid = xmlDoc.validate(xsdDoc)
          t.true(valid, 'valid xml')

          if (!valid) {
            xmlDoc.validationErrors.forEach(function(error) {
              console.log('ERROR', error.line, error.message)
            })
          }
        })
      })
    })
  })
})
