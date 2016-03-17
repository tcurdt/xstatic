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

function update(file, doc) {
  file.load = Lazy.load(doc)
  doc.file = file
  return file
}

Test('meta overrides layout', function(t) {

  const collection = setup(t, { layout: 'design/templates/post.tpl' })

  return collection.update([

    update({
      type: Change.A,
      lmod: 1,
      path: 'content/posts/2014/slug1/index.txt',
    }, {
      meta: { layout: 'page.tpl' },
      body: { data: 'post1' },
    }),
    update({
      type: Change.A,
      lmod: 1,
      path: 'design/templates/page.tpl',
    }, {
      body: { data: 'PAGE:{{ content|safe }}' }
    }),

  ]).then(function(changes1){

    t.equal(collection.length, 1, 'has results')

    const file = collection.get('content/posts/2014/slug1/index.txt')

    t.ok(file, 'exists')
    return file.load.then(function(doc) {
      t.equal(doc.body.data, 'PAGE:post1')
    }).catch(function(err) { t.fail(err) })

  })
})


Test('applies layout to all posts', function(t) {

  const collection = setup(t, { layout: 'post.tpl' })

  return collection.update([

    update({
      type: Change.A,
      lmod: 1,
      path: 'content/posts/2014/slug1/index.txt',
    }, {
      body: { data: 'post1' }
    }),
    update({
      type: Change.A,
      lmod: 1,
      path: 'content/posts/2015/slug1/index.txt',
    }, {
      body: { data: 'post2' }
    }),
    update({
      type: Change.A,
      lmod: 1,
      path: 'design/templates/post.tpl',
    }, {
      body: { data: 'POST:{{ content|safe }}' }
    }),

  ]).then(function(changes1){

    t.equal(collection.length, 2, 'has results')

    const file1 = collection.get('content/posts/2014/slug1/index.txt')
    const file2 = collection.get('content/posts/2015/slug1/index.txt')

    t.ok(file1, 'exists')
    t.ok(file2, 'exists')

    return Promise.all([
      file1.load.then(function(doc) {
        t.equal(doc.body.data, 'POST:post1')
      }).catch(function(err) { t.fail(err) }),

      file2.load.then(function(doc) {
        t.equal(doc.body.data, 'POST:post2')
      }).catch(function(err) { t.fail(err) })
    ])
  })
})

Test('applies without layout', function(t) {

  const collection = setup(t)

  return collection.update([

    update({
      type: Change.A,
      lmod: 1,
      path: 'content/index.txt',
    }, {
      meta: { title: 'TITLE' },
      body: { data: 'PAGE:{{title}}' }
    }),

  ]).then(function(changes1){

    t.equal(collection.length, 1, 'has results')

    const file = collection.get('content/index.txt')

    t.ok(file, 'exists')

    return file.load.then(function(doc) {
      t.equal(doc.body.data, 'PAGE:TITLE')
    }).catch(function(err) { t.fail(err) })

  })
})

Test('resolves extends', function(t) {

  const collection = setup(t)

  return collection.update([

    update({
      type: Change.A,
      lmod: 1,
      path: 'content/index.txt',
    }, {
      body: { data: '{% extends \'base.tpl\' %}{% block content %}CHILD{% endblock %}' }
    }),
    update({
      type: Change.A,
      lmod: 1,
      path: 'design/templates/base.tpl',
    }, {
      body: { data: 'PARENT:{% block content %}{% endblock %}' }
    }),

  ]).then(function(changes1){

    t.equal(collection.length, 1, 'has results')

    const file = collection.get('content/index.txt')

    t.ok(file, 'exists')

    return file.load.then(function(doc) {
      t.equal(doc.body.data, 'PARENT:CHILD')
    }).catch(function(err) { t.fail(err) })

  })
})

Test('resolves includes', function(t) {

  const collection = setup(t)

  return collection.update([

    update({
      type: Change.A,
      lmod: 1,
      path: 'content/index.txt',
    }, {
      body: { data: '{% include "partial.tpl" %}' }
    }),
    update({
      type: Change.A,
      lmod: 1,
      path: 'design/templates/partial.tpl',
    }, {
      body: { data: 'PARTIAL' }
    }),

  ]).then(function(changes1){

    t.equal(collection.length, 1, 'has results')

    const file = collection.get('content/index.txt')

    t.ok(file, 'exists')

    return file.load.then(function(doc) {
      t.equal(doc.body.data, 'PARTIAL')
    }).catch(function(err) { t.fail(err) })

  })
})

Test('report errors', function(t) {

  const collection = setup(t)

  return collection.update([

    update({
      type: Change.A,
      lmod: 1,
      path: 'content/index.txt',
    }, {
      body: { data: '{{ a | b }}' }
    }),

  ]).then(function(changes1){

    t.equal(collection.length, 1, 'has results')

    const file = collection.get('content/index.txt')

    t.ok(file, 'exists')

    return file.load.then(function(doc) {
      t.fail('error should fail')
    }).catch(function(err) { t.pass('error on invalid') })

  })
})
