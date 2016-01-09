"use strict"

const Test = require('blue-tape')

const Type = require('../lib/enum').changes
const _ = require('../lib/utils')

function setup(t) {
  const xs = require('../lib')
  const project = new xs('build')

  const files = project.glob('content/**/*.md')
  const plugin = require('../lib/plugins/frontmatter')(project)

  return plugin(files)
}

Test('extracts frontmatter', function(t) {
  const collection = setup(t)

  return collection.update([
    {
      type: Type.A,
      lmod: 1,
      path: 'content/posts/2014/slug1/index.md',
      load: _.lazyLoad({ body: '---\ntitle: title1\n---\npost1' }),
    },
  ]).then(function(changes1){

    t.ok(collection.length === 1, 'has result')

    const file = collection.get('content/posts/2014/slug1/index.html')
    t.ok(file, 'exists')

    return file.load.then(function(f){
      t.equal(f.body, 'post1')
      t.equal(f.meta.title, 'title1')
    })

  })
})
