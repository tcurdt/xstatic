'use strict'

const Test = require('blue-tape')
const Xstatic = require('@xstatic/core')
const Change = Xstatic.changes
const Lazy = Xstatic.lazy

function setup(t) {
  const project = new Xstatic('build')

  const files = project.glob('content/**/*.txt')
  const zip = require('../lib')(project)

  return zip(files,{ filename: 'output.zip' })
}

Test('creates zip of all files', function(t) {
  const collection = setup(t)

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

    const file = collection.get('output.zip')

    t.ok(file, 'exits')

    return file.load.then(function(f){
    })
  })
})
