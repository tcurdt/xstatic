'use strict'

const Test = require('blue-tape')
const Xstatic = require('xstatic-core')
const Change = Xstatic.changes
const Lazy = Xstatic.lazy

function setup(t, cb) {
  const project = new Xstatic('build')
  const files = project.glob('content/**/*.md')
  const frontmatter = require('../lib')(project)
  const collection = frontmatter(files)

  return cb(project, collection)
}

Test('extracts frontmatter', function(t) {
  return setup(t, function(project, collection) {
    return collection.update([
      {
        type: Change.A,
        lmod: 1,
        path: 'content/posts/2014/slug1/index.md',
        load: Lazy.load({ body: '---\ntitle: title1\n---\npost1' }),
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
})
