'use strict'

const Test = require('blue-tape')
const Xstatic = require('../packages/core')

const Type = require('../packages/core/enum').changes

function setup(t, cb) {
  const project = new Xstatic('build')
  const files = project.glob('content/**/*.md')
  const plugin = require('../packages/plugin-markdown')(project)
  const collection = plugin(files)

  return cb(project, collection)
}


Test('converts markdown to html', function(t) {
  return setup(t, function(project, collection) {
    const _ = project.utils

    return collection.update([
      {
        type: Type.A,
        lmod: 1,
        path: 'content/posts/2014/slug1/index.md',
        load: _.lazyLoad({ body: '# test' }),
      },
    ]).then(function(changes1){

      t.ok(collection.length === 1, 'has result')

      const file = collection.get('content/posts/2014/slug1/index.html')

      t.ok(file, 'exists')

      return file.load.then(function(f){
        t.equal(f.body, '<h1 id="test">test</h1>\n')
      })

    })
  })
})
