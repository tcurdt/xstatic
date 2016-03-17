'use strict'

const Test = require('blue-tape')
const Xstatic = require('xstatic-core')
const Lazy = Xstatic.lazy
const Change = Xstatic.changes

function setup(t, cb) {
  const project = new Xstatic('build', {
    url: 'URL',
    title: 'TITLE',
    author: 'JOHN DOE'
  })

  return cb(project)
}

function update(file, doc) {
  file.load = Lazy.load(doc)
  doc.file = file
  return file
}

Test('variable expansion from project, collection and document context', function(t) {
  return setup(t, function(project) {

    const glob = project.glob
    const pages = glob('content/**/*.txt')
    const plugin = require('../lib')(project)

    const options = {
      context: { biffy: 'CLYRO' },
    }
    const collection = plugin(pages, options)

    return collection.update([

      update({
        type: Change.A,
        lmod: 1,
        path: 'content/page1.txt',
      }, {
        meta: { foo: 'FIGHTERS' },
        body: { data: 'page1:{{site.title}}:{{foo}}:{{biffy}}' }
      }),

    ]).then(function(changes1){

      t.equal(collection.length, 1, 'has results')

      const file = collection.get('content/page1.txt')

      return file.load.then(function(doc) {
        t.equal(doc.body.data, 'page1:TITLE:FIGHTERS:CLYRO')
      }).catch(function(err){ t.fail(err) })

    })
  })
})

Test('loading of partials', function(t) {
  return setup(t, function(project) {

    const glob = project.glob
    const pages = glob('content/**/*.txt')
    const plugin = require('../lib')(project)

    const partials = glob('design/partials/**/*.txt')
    const options = {
      partials: partials,
    }
    const collection = plugin(pages, options)

    return collection.update([

      update({
        type: Change.A,
        lmod: 1,
        path: 'design/partials/base.txt',
      }, {
        body: { data: 'PARTIAL' }
      }),
      update({
        type: Change.A,
        lmod: 1,
        path: 'content/page1.txt',
      }, {
        body: { data: 'B:{{>base}}:E' }
      }),

    ]).then(function(changes1){

      t.equal(collection.length, 1, 'has results')

      const file = collection.get('content/page1.txt')

      return file.load.then(function(doc) {
        t.equal(doc.body.data, 'B:PARTIAL:E')
      }).catch(function(err) { t.fail(err) })

    })
  })
})

Test('use of custom helpers', function(t) {
  return setup(t, function(project) {

    const glob = project.glob
    const pages = glob('content/**/*.txt')
    const plugin = require('../lib')(project)

    const options = {
      helpers: [
        function(handlebars) {
          handlebars.registerHelper('foo', function() {
            return 'FIGHTERS'
          })
        }
      ]
    }
    const collection = plugin(pages, options)

    return collection.update([

      update({
        type: Change.A,
        lmod: 1,
        path: 'content/page1.txt',
      }, {
        body: { data: '{{#foo}}{{/foo}}' }
      }),

    ]).then(function(changes1){

      t.equal(collection.length, 1, 'has results')

      const file = collection.get('content/page1.txt')

      return file.load.then(function(doc) {
        t.equal(doc.body.data, 'FIGHTERS')
      }).catch(function(err){ t.fail(err) })

    })
  })
})
