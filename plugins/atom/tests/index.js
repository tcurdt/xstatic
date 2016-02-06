'use strict'

const Test = require('blue-tape')
const Xstatic = require('../packages/core/lib')
const Change = require('../packages/core/lib/changes')
const Lazy = require('../packages/core/lib/lazy')

const Fs = require('fs')
const Libxml = require('libxmljs')

function setup(t, cb) {
  const project = new Xstatic('build')
  const files = project.glob('content/**/*.txt')
  const feed = require('@xstatic/atom')(project)
  const collection = feed(files, {
    url: 'http://localhost',
    title: 'test title',
    author: 'test author'
  })

  return cb(project, collection)
}

Test('creates feed of all posts', function(t) {
  return setup(t, function(project, collection) {
    return collection.update([

      {
        type: Change.A,
        lmod: 1445556599000,
        path: 'content/posts/2014/slug1/index.txt',
        load: Lazy.load({
          meta: { title: 'title post1' },
          lmod: 1445556599000,
          path: 'content/posts/2014/slug1/index.txt',
          body: 'post1'
        }),
      },
      {
        type: Change.A,
        lmod: 1445556599000 - 60*1000,
        path: 'content/posts/2015/slug1/index.txt',
        load: Lazy.load({
          meta: { title: 'title post2' },
          lmod: 1445556599000 - 60*1000,
          path: 'content/posts/2015/slug1/index.txt',
          body: 'post2'
        }),
      },

    ]).then(function(changes){

      t.ok(collection.length === 1, 'has result')

      const file = collection.get('feed.xml')

      t.ok(file, 'exists')

      return file.load.then(function(f){

        t.doesNotThrow(function(){

          const xsd = Fs.readFileSync('./tests/plugin-atom.xsd').toString()
          const xsdDoc = Libxml.parseXml(xsd)
          const xmlDoc = Libxml.parseXml(f.body)
          const valid = xmlDoc.validate(xsdDoc)
          t.true(valid, 'valid xml')

          if (!valid) {
            xmlDoc.validationErrors.forEach(function(error){
              console.log('ERROR', error.line, error.message)
            })
          }
        })

      })
    })
  })
})
