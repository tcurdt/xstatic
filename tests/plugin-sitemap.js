'use strict'

const Test = require('blue-tape')
const Fs = require('fs')
const Libxml = require('libxmljs')

const Type = require('../lib/enum').changes
const _ = require('../lib/utils')

function setup(t) {
  const Xstatic = require('../lib')
  const project = new Xstatic('build')

  const files = project.glob('content/**/*.txt')
  const sitemap = require('../lib/plugins/sitemap')(project)

  return sitemap(files)
}

Test('creates sitemap of all files', function(t) {
  const collection = setup(t)

  const changesIn = [
    {
      type: Type.A,
      lmod: 1445556599000,
      path: 'content/posts/2014/slug1/index.txt',
      load: _.lazyLoad({ body: 'post1' }),
    },
    {
      type: Type.A,
      lmod: 1445556599000,
      path: 'content/posts/2015/slug1/index.txt',
      load: _.lazyLoad({ body: 'post2' }),
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

        const xsd = Fs.readFileSync('./tests/plugin-sitemap.xsd').toString()
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
