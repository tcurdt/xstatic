'use strict'

const Test = require('blue-tape')

const Type = require('../lib/enum').changes
const _ = require('../lib/utils')

function setup(t, options) {
  const xs = require('../lib')
  const project = new xs('build', {
    url: 'URL',
    title: 'TITLE',
    author: 'JOHN DOE'
  })
  const glob = project.glob

  const pages = glob('content/**/*.txt')
  const plugin = require('../lib/plugins/handlebars')(project)
  return plugin(pages, options)
}

Test('variable expansion from project, collection and document context', function(t) {

  const collection = setup(t, { context:{ biffy: 'CLYRO' }})

  return collection.update([

    {
      type: Type.A,
      lmod: 1,
      path: 'content/page1.txt',
      load: _.lazyLoad({ body: 'page1:{{title}}:{{foo}}:{{biffy}}', meta: { foo: 'FIGHTERS' }}),
    },

  ]).then(function(changes1){

    t.ok(collection.length === 1, 'has results')

    const file = collection.get('content/page1.txt')

    return file.load.then(function(f){
      t.equal(f.body, 'page1:TITLE:FIGHTERS:CLYRO')
    }).catch(function(err){ t.fail(err) })

  })
})
