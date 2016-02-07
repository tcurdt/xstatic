'use strict'

const Test = require('blue-tape')
const Xstatic = require('@Xstatic/core')
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

      {
        type: Change.A,
        lmod: 1,
        path: 'content/page1.txt',
        load: Lazy.load({ body: 'page1:{{site.title}}:{{foo}}:{{biffy}}', meta: { foo: 'FIGHTERS' }}),
      },

    ]).then(function(changes1){

      t.ok(collection.length === 1, 'has results')

      const file = collection.get('content/page1.txt')

      return file.load.then(function(f){
        t.equal(f.body, 'page1:TITLE:FIGHTERS:CLYRO')
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

      {
        type: Change.A,
        lmod: 1,
        path: 'design/partials/base.txt',
        load: Lazy.load({ body: 'PARTIAL', path: 'design/partials/base.txt' }),
      },
      {
        type: Change.A,
        lmod: 1,
        path: 'content/page1.txt',
        load: Lazy.load({ body: 'B:{{>base}}:E' }),
      },

    ]).then(function(changes1){

      t.ok(collection.length === 1, 'has results')

      const file = collection.get('content/page1.txt')

      return file.load.then(function(f){
        t.equal(f.body, 'B:PARTIAL:E')
      }).catch(function(err){ t.fail(err) })

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
          return {
            foo: function() {
              return 'FIGHTERS'
            }
          }
        }
      ]
    }
    const collection = plugin(pages, options)

    return collection.update([

      {
        type: Change.A,
        lmod: 1,
        path: 'content/page1.txt',
        load: Lazy.load({ body: '{{#foo}}{{/foo}}' }),
      },

    ]).then(function(changes1){

      t.ok(collection.length === 1, 'has results')

      const file = collection.get('content/page1.txt')

      return file.load.then(function(f){
        t.equal(f.body, 'FIGHTERS')
      }).catch(function(err){ t.fail(err) })

    })
  })
})