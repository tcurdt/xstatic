'use strict'

const Test = require('blue-tape')
const Xstatic = require('xstatic-core')
const Lazy = Xstatic.lazy
const Change = Xstatic.changes

function update(file, doc) {
  file.load = Lazy.load(doc)
  doc.file = file
  return file
}

function setup(t, cb) {
  const project = new Xstatic('build')
  const files = project.glob('content/**/*')

  const Merge       = require('xstatic-merge')(project)
  const Template    = require('xstatic-handlebars')(project)
  const Markdown    = require('xstatic-markdown')(project)
  const Feed        = require('xstatic-atom')(project)
  const Sitemap     = require('xstatic-sitemap')(project)
  const Frontmatter = require('xstatic-frontmatter')(project)
  const Sort        = require('xstatic-sort')(project)
  const Glob = project.glob

  const posts  = Sort(Glob('content/posts/**/index.md'))
  const design = Glob('design/templates/*', { basedir: 'design/templates' })

  const postsHtml = Markdown(Frontmatter(posts))
  const postsFull = Template(postsHtml, {
    layouts: design,
    layout: 'post.html',
    // context: { posts: postsHtml }
  })

  const sitemap = Sitemap(postsHtml)
  const feed = Feed(postsHtml)

  const collection = Merge([ feed, sitemap, postsFull ])

  return cb(project, collection)
}



function sortedByPath(arr) {
  arr.sort(function(a, b){
    return a.path > b.path
  })
  return arr
}

function filesFromCollection(array) {
  return array.map(function(file){ return { lmod: file.lmod, path: file.path }})
}

function filesFromChanges(array) {
  return array.map(function(change){ return { lmod: change.lmod, path: change.path, type: change.type }})
}

function add(t) {
  return setup(t, function(project, collection) {
    return collection.update([

      update({
        type: Change.A,
        lmod: 1,
        path: 'content/posts/2014/slug1/index.md',
      }, {
        body: { data: '---\ntitle: t2014\n---\ncontent' }
      }),
      update({
        type: Change.A,
        lmod: 1,
        path: 'content/posts/2015/slug1/index.md',
      }, {
        body: { data: '---\ntitle: t2015\n---\ncontent' }
      }),
      update({
        type: Change.A,
        lmod: 1,
        path: 'design/templates/post.html',
      }, {
        body: { data: 'TEMPLATE {{position}}/{{length}} {{{content}}}' }
      }),

    ]).then(function(changes){

      t.deepEqual(sortedByPath(filesFromCollection(collection)), sortedByPath([
        { lmod: 1, path: 'content/posts/2014/slug1/index.html' },
        { lmod: 1, path: 'content/posts/2015/slug1/index.html' },
        { lmod: 1, path: 'feed.xml' },
        { lmod: 1, path: 'sitemap.xml' },
      ]))

      t.deepEqual(sortedByPath(filesFromChanges(changes)), sortedByPath([
        { type: Change.A, lmod: 1, path: 'content/posts/2014/slug1/index.html' },
        { type: Change.A, lmod: 1, path: 'content/posts/2015/slug1/index.html' },
        { type: Change.A, lmod: 1, path: 'feed.xml' },
        { type: Change.A, lmod: 1, path: 'sitemap.xml' },
      ]))

      return Promise.all([
        'content/posts/2014/slug1/index.html',
        'content/posts/2015/slug1/index.html',
      ].map(function(path) {
        const file = collection.get(path)
        t.ok(file, 'exists')
        return file.load
      })).then(function(docs) {
        docs.forEach(function(doc) {
          t.ok(doc.meta && doc.meta.title, 'post has title')
        })
      }).then(function() {
        return collection
      })

    })
  })
}

Test('setup works', function(t) {
  return add(t)
})

Test('updating a post updates the post page, feed and sitemap', function(t) {
  return add(t).then(function(collection){
    return collection.update([

      update({
        type: Change.M,
        lmod: 2,
        path: 'content/posts/2014/slug1/index.md',
      }, {
        body: { data: 'content' }
      }),

    ]).then(function(changes){

      t.deepEqual(sortedByPath(filesFromCollection(collection)), sortedByPath([
        { lmod: 2, path: 'content/posts/2014/slug1/index.html' },
        { lmod: 1, path: 'content/posts/2015/slug1/index.html' },
        { lmod: 2, path: 'feed.xml' },
        { lmod: 2, path: 'sitemap.xml' },
      ]), 'content')

      t.deepEqual(sortedByPath(filesFromChanges(changes)), sortedByPath([
        { type: Change.M, lmod: 2, path: 'content/posts/2014/slug1/index.html' },
        { type: Change.M, lmod: 2, path: 'feed.xml' },
        { type: Change.M, lmod: 2, path: 'sitemap.xml' },
      ]), 'changes')

    })
  })
})

Test('updating the post template updates all post pages (but not the sitemap or feed)', function(t) {
  return add(t).then(function(collection){
    return collection.update([

      update({
        type: Change.M,
        lmod: 2,
        path: 'design/templates/post.html',
      }, {
        body: { data: 'content' }
      }),

    ]).then(function(changes){

      t.deepEqual(sortedByPath(filesFromCollection(collection)), sortedByPath([
        { lmod: 2, path: 'content/posts/2014/slug1/index.html' },
        { lmod: 2, path: 'content/posts/2015/slug1/index.html' },
        { lmod: 1, path: 'feed.xml' },
        { lmod: 1, path: 'sitemap.xml' },
      ]), 'content')

      t.deepEqual(sortedByPath(filesFromChanges(changes)), sortedByPath([
        { type: Change.M, lmod: 2, path: 'content/posts/2014/slug1/index.html' },
        { type: Change.M, lmod: 2, path: 'content/posts/2015/slug1/index.html' },
      ]), 'changes')

    })
  })
})

Test('deleting a post deletes the post page and updates feed and sitemap', function(t) {
  return add(t).then(function(collection){
    return collection.update([

      update({
        type: Change.D,
        lmod: 2,
        path: 'content/posts/2014/slug1/index.md',
      }, {
        body: { data: 'content' }
      }),
      update({
        type: Change.D,
        lmod: 2,
        path: 'content/posts/2014/slug1/index.md',
      }, {
        body: { data: 'content' }
      }),

    ]).then(function(changes){

      t.deepEqual(sortedByPath(filesFromCollection(collection)), sortedByPath([
        { lmod: 1, path: 'content/posts/2015/slug1/index.html' },
        { lmod: 2, path: 'feed.xml' },
        { lmod: 2, path: 'sitemap.xml' },
      ]), 'content')

      t.deepEqual(sortedByPath(filesFromChanges(changes)), sortedByPath([
        { type: Change.D, lmod: 2, path: 'content/posts/2014/slug1/index.html' },
        { type: Change.M, lmod: 2, path: 'feed.xml' },
        { type: Change.M, lmod: 2, path: 'sitemap.xml' },
      ]), 'changes')

    })
  })
})
