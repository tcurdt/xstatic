'use strict'

const Test = require('blue-tape')

const Type = require('../lib/enum').changes
const _ = require('../lib/utils')

function setup(t) {
  const xs = require('../lib')
  const project = new xs('build')

  const files = project.glob('content/**/*.txt')
  const zip = require('../lib/plugins/zip')(project)

  return zip(files,{ filename: 'output.zip' })
}

Test('creates zip of all files', function(t) {
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

    const file = collection.get('output.zip')

    t.ok(file, 'exits')

    return file.load.then(function(f){
    })
  })
})
