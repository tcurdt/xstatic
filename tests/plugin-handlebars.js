'use strict'

const Test = require('blue-tape')

const Type = require('../lib/enum').changes
const _ = require('../lib/utils')

function setup(t) {
  const Xstatic = require('../lib')
  const project = new Xstatic('build', {
    url: 'URL',
    title: 'TITLE',
    author: 'JOHN DOE'
  })
  return project
}

Test('variable expansion from project, collection and document context', function(t) {

  const project = setup(t)
  const glob = project.glob
  const pages = glob('content/**/*.txt')
  const plugin = require('../lib/plugins/handlebars')(project)

  const options = {
    context: { biffy: 'CLYRO' },
  }
  const collection = plugin(pages, options)

  return collection.update([

    {
      type: Type.A,
      lmod: 1,
      path: 'content/page1.txt',
      load: _.lazyLoad({ body: 'page1:{{site.title}}:{{foo}}:{{biffy}}', meta: { foo: 'FIGHTERS' }}),
    },

  ]).then(function(changes1){

    t.ok(collection.length === 1, 'has results')

    const file = collection.get('content/page1.txt')

    return file.load.then(function(f){
      t.equal(f.body, 'page1:TITLE:FIGHTERS:CLYRO')
    }).catch(function(err){ t.fail(err) })

  })
})

Test('loading of partials', function(t) {

  const project = setup(t)
  const glob = project.glob
  const pages = glob('content/**/*.txt')
  const plugin = require('../lib/plugins/handlebars')(project)

  const partials = glob('design/partials/**/*.txt')
  const options = {
    partials: partials,
  }
  const collection = plugin(pages, options)

  return collection.update([

    {
      type: Type.A,
      lmod: 1,
      path: 'design/partials/base.txt',
      load: _.lazyLoad({ body: 'PARTIAL', path: 'design/partials/base.txt' }),
    },
    {
      type: Type.A,
      lmod: 1,
      path: 'content/page1.txt',
      load: _.lazyLoad({ body: 'B:{{>base}}:E' }),
    },

  ]).then(function(changes1){

    t.ok(collection.length === 1, 'has results')

    const file = collection.get('content/page1.txt')

    return file.load.then(function(f){
      t.equal(f.body, 'B:PARTIAL:E')
    }).catch(function(err){ t.fail(err) })

  })
})

Test('use of custom helpers', function(t) {

  const project = setup(t)
  const glob = project.glob
  const pages = glob('content/**/*.txt')
  const plugin = require('../lib/plugins/handlebars')(project)

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
      type: Type.A,
      lmod: 1,
      path: 'content/page1.txt',
      load: _.lazyLoad({ body: '{{#foo}}{{/foo}}' }),
    },

  ]).then(function(changes1){

    t.ok(collection.length === 1, 'has results')

    const file = collection.get('content/page1.txt')

    return file.load.then(function(f){
      t.equal(f.body, 'FIGHTERS')
    }).catch(function(err){ t.fail(err) })

  })
})
