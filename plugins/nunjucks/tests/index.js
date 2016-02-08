'use strict'

const Test = require('blue-tape')
const Xstatic = require('xstatic-core')
const Lazy = Xstatic.lazy
const Change = Xstatic.changes
const _ = require('@tcurdt/tinyutils')

function setup(t, options) {
  const project = new Xstatic('build')
  const glob = project.glob

  const posts = glob('content/**/*.txt')
  const layouts = glob('design/templates/*.tpl', { basedir: 'design/templates' })
  const plugin = require('../lib')(project)

  return plugin(posts, _.merge({
    layouts: layouts,
  }, options))
}

Test('meta overrides layout', function(t) {

  const collection = setup(t, { layout: 'design/templates/post.tpl' })

  return collection.update([

    {
      type: Change.A,
      lmod: 1,
      path: 'content/posts/2014/slug1/index.txt',
      load: Lazy.load({ body: 'post1', meta:{ layout: 'page.tpl' }}),
    },
    {
      type: Change.A,
      lmod: 1,
      path: 'design/templates/page.tpl',
      load: Lazy.load({ body: 'PAGE:{{ content|safe }}' }),
    },

  ]).then(function(changes1){

    t.ok(collection.length === 1, 'has results')

    const file = collection.get('content/posts/2014/slug1/index.txt')

    t.ok(file, 'exists')
    return file.load.then(function(f){
      t.equal(f.body, 'PAGE:post1')
    }).catch(function(err){ t.fail(err) })

  })
})


Test('applies layout to all posts', function(t) {

  const collection = setup(t, { layout: 'post.tpl' })

  return collection.update([

    {
      type: Change.A,
      lmod: 1,
      path: 'content/posts/2014/slug1/index.txt',
      load: Lazy.load({ body: 'post1' }),
    },
    {
      type: Change.A,
      lmod: 1,
      path: 'content/posts/2015/slug1/index.txt',
      load: Lazy.load({ body: 'post2' }),
    },
    {
      type: Change.A,
      lmod: 1,
      path: 'design/templates/post.tpl',
      load: Lazy.load({ body: 'POST:{{ content|safe }}' }),
    },

  ]).then(function(changes1){

    t.ok(collection.length === 2, 'has results')

    const file1 = collection.get('content/posts/2014/slug1/index.txt')
    const file2 = collection.get('content/posts/2015/slug1/index.txt')

    t.ok(file1, 'exists')
    t.ok(file2, 'exists')

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
      type: Change.A,
      lmod: 1,
      path: 'content/index.txt',
      load: Lazy.load({ body: 'PAGE:{{title}}', meta: { title: 'TITLE' }}),
    },

  ]).then(function(changes1){

    t.ok(collection.length === 1, 'has results')

    const file = collection.get('content/index.txt')

    t.ok(file, 'exists')

    return file.load.then(function(f){
      t.equal(f.body, 'PAGE:TITLE')
    }).catch(function(err){ t.fail(err) })

  })
})

Test('resolves extends', function(t) {

  const collection = setup(t)

  return collection.update([

    {
      type: Change.A,
      lmod: 1,
      path: 'content/index.txt',
      load: Lazy.load({ body: '{% extends \'base.tpl\' %}{% block content %}CHILD{% endblock %}' }),
    },
    {
      type: Change.A,
      lmod: 1,
      path: 'design/templates/base.tpl',
      load: Lazy.load({ body: 'PARENT:{% block content %}{% endblock %}' }),
    },

  ]).then(function(changes1){

    t.ok(collection.length === 1, 'has results')

    const file = collection.get('content/index.txt')

    t.ok(file, 'exists')

    return file.load.then(function(f){
      t.equal(f.body, 'PARENT:CHILD')
    }).catch(function(err){ t.fail(err) })

  })
})

Test('resolves includes', function(t) {

  const collection = setup(t)

  return collection.update([

    {
      type: Change.A,
      lmod: 1,
      path: 'content/index.txt',
      load: Lazy.load({ body: '{% include "partial.tpl" %}' }),
    },
    {
      type: Change.A,
      lmod: 1,
      path: 'design/templates/partial.tpl',
      load: Lazy.load({ body: 'PARTIAL' }),
    },

  ]).then(function(changes1){

    t.ok(collection.length === 1, 'has results')

    const file = collection.get('content/index.txt')

    t.ok(file, 'exists')

    return file.load.then(function(f){
      t.equal(f.body, 'PARTIAL')
    }).catch(function(err){ t.fail(err) })

  })
})

Test('report errors', function(t) {

  const collection = setup(t)

  return collection.update([

    {
      type: Change.A,
      lmod: 1,
      path: 'content/index.txt',
      load: Lazy.load({ body: '{{ a | b }}' }),
    },

  ]).then(function(changes1){

    t.ok(collection.length === 1, 'has results')

    const file = collection.get('content/index.txt')

    t.ok(file, 'exists')

    return file.load.then(function(f){
      t.fail('error should fail')
    }).catch(function(err){ t.pass('error on invalid') })

  })
})
