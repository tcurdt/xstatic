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


Test('creates sitemap of all files', function(t) {
  return setup(t, function(project, collection) {

    const changesIn = [
      {
        type: Change.A,
        lmod: 1445556599000,
        path: 'content/posts/2014/slug1/index.txt',
        load: Lazy.load({ body: 'post1' }),
      },
      {
        type: Change.A,
        lmod: 1445556599000,
        path: 'content/posts/2015/slug1/index.txt',
        load: Lazy.load({ body: 'post2' }),
      },
    ]

    return collection.update(changesIn).then(function(changesOut){

      t.ok(collection.length === 1, 'has output')

      const file = collection.get('sitemap.xml')

      t.ok(file, 'exits')

      return file.load.then(function(f){

        changesIn.forEach(function(change){
          t.ok(!change.load.isFulfilled, change.path + ' not loaded')
        })

        t.doesNotThrow(function(){

          const xsd = Fs.readFileSync(__dirname + '/sitemap.xsd').toString()
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
