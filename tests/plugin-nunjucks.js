'use strict'

const Test = require('blue-tape')

const Type = require('../lib/enum').changes
const _ = require('../lib/utils')

function setup(t, options) {
  const xs = require('../lib')
  const project = new xs('build')

  const posts = project.glob('content/**/*.txt')
  const templates = project.glob('design/**/*.tpl')
  const plugin = require('../lib/plugins/nunjucks')(project)

  return plugin(templates, posts, options)
}

Test('meta overrides layout', function(t) {

  const collection = setup(t, { layout: 'design/templates/post.tpl' })

  return collection.update([

    {
      type: Type.A,
      lmod: 1,
      path: 'content/posts/2014/slug1/index.txt',
      load: _.lazyLoad({ body: 'post1', meta:{ layout: 'design/templates/page.tpl' }}),
    },
    {
      type: Type.A,
      lmod: 1,
      path: 'design/templates/page.tpl',
      load: _.lazyLoad({ body: 'PAGE:{{ content|safe }}' }),
    },

  ]).then(function(changes1){

    t.ok(collection.length === 1, 'has results')

    const file = collection.get('content/posts/2014/slug1/index.txt')

    return file.load.then(function(f){
      t.equal(f.body, 'PAGE:post1')
    }).catch(function(err){ t.fail(err) })

  })
})


Test('applies layout to all posts', function(t) {

  const collection = setup(t, { layout: 'design/templates/post.tpl' })

  return collection.update([

    {
      type: Type.A,
      lmod: 1,
      path: 'content/posts/2014/slug1/index.txt',
      load: _.lazyLoad({ body: 'post1' }),
    },
    {
      type: Type.A,
      lmod: 1,
      path: 'content/posts/2015/slug1/index.txt',
      load: _.lazyLoad({ body: 'post2' }),
    },
    {
      type: Type.A,
      lmod: 1,
      path: 'design/templates/post.tpl',
      load: _.lazyLoad({ body: 'POST:{{ content|safe }}' }),
    },

  ]).then(function(changes1){

    t.ok(collection.length === 2, 'has results')

    const file1 = collection.get('content/posts/2014/slug1/index.txt')
    const file2 = collection.get('content/posts/2015/slug1/index.txt')

    t.ok(file1, 'exits')
    t.ok(file2, 'exits')

    return Promise.all([
      file1.load.then(function(f){
        t.equal(f.body, 'POST:post1')
      }).catch(function(err){ t.fail(err) }),

      file2.load.then(function(f){
        t.equal(f.body, 'POST:post2')
      }).catch(function(err){ t.fail(err) })
    ])
  })
})

Test('applies without layout', function(t) {

  const collection = setup(t)

  return collection.update([

    {
      type: Type.A,
      lmod: 1,
      path: 'content/index.txt',
      load: _.lazyLoad({ body: 'PAGE:{{title}}', meta: { title: 'TITLE' }}),
    },

  ]).then(function(changes1){

    t.ok(collection.length === 1, 'has results')

    const file = collection.get('content/index.txt')

    t.ok(file, 'exits')

    return file.load.then(function(f){
      t.equal(f.body, 'PAGE:TITLE')
    }).catch(function(err){ t.fail(err) })

  })
})

Test('resolves extends', function(t) {

  const collection = setup(t)

  return collection.update([

    {
      type: Type.A,
      lmod: 1,
      path: 'content/index.txt',
      load: _.lazyLoad({ body: '{% extends \'base.tpl\' %}{% block content %}CHILD{% endblock %}' }),
    },
    {
      type: Type.A,
      lmod: 1,
      path: 'design/templates/base.tpl',
      load: _.lazyLoad({ body: 'PARENT:{% block content %}{% endblock %}' }),
    },

  ]).then(function(changes1){

    t.ok(collection.length === 1, 'has results')

    const file = collection.get('content/index.txt')

    t.ok(file, 'exits')

    return file.load.then(function(f){
      t.equal(f.body, 'PARENT:CHILD')
    }).catch(function(err){ t.fail(err) })

  })
})

Test('resolves includes', function(t) {

  const collection = setup(t)

  return collection.update([

    {
      type: Type.A,
      lmod: 1,
      path: 'content/index.txt',
      load: _.lazyLoad({ body: '{% include "partial.tpl" %}' }),
    },
    {
      type: Type.A,
      lmod: 1,
      path: 'design/templates/partial.tpl',
      load: _.lazyLoad({ body: 'PARTIAL' }),
    },

  ]).then(function(changes1){

    t.ok(collection.length === 1, 'has results')

    const file = collection.get('content/index.txt')

    t.ok(file, 'exits')

    return file.load.then(function(f){
      t.equal(f.body, 'PARTIAL')
    }).catch(function(err){ t.fail(err) })

  })
})

Test('report errors', function(t) {

  const collection = setup(t)

  return collection.update([

    {
      type: Type.A,
      lmod: 1,
      path: 'content/index.txt',
      load: _.lazyLoad({ body: '{{ a | b }}' }),
    },

  ]).then(function(changes1){

    t.ok(collection.length === 1, 'has results')

    const file = collection.get('content/index.txt')

    t.ok(file, 'exits')

    return file.load.then(function(f){
      t.fail('error should fail')
    }).catch(function(err){ t.pass('error on invalid') })

  })
})
