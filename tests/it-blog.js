'use strict'

const Test = require('blue-tape')

const Type = require('../lib/enum').changes
const _ = require('../lib/utils')

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

function setup() {

  const xs = require('../lib')
  const project = new xs('build')

  const Merge       = require('../lib/plugins/merge')(project)
  const Template    = require('../lib/plugins/handlebars')(project)
  const Markdown    = require('../lib/plugins/markdown')(project)
  const Feed        = require('../lib/plugins/atom')(project)
  const Sitemap     = require('../lib/plugins/sitemap')(project)
  const Frontmatter = require('../lib/plugins/frontmatter')(project)
  const Glob = project.glob

  const posts  = Glob('content/posts/**/index.md')
  const design = Glob('design/**/*', { basedir: 'design/templates' })

  const posts_html = Markdown(Frontmatter(posts))
  const posts_full = Template(posts_html, {
    layouts: design,
    default: 'post.html',
    context: { posts: posts_html }
  })

  const sitemap = Sitemap(posts_html)
  const feed = Feed(posts_html)

  return Merge([ feed, sitemap, posts_full ])
}

function add(t) {
  const collection = setup()

  return collection.update([

    {
      type: Type.A,
      lmod: 1,
      path: 'content/posts/2014/slug1/index.md',
      load: _.lazyLoad({ body: 'content' }),
    },
    {
      type: Type.A,
      lmod: 1,
      path: 'content/posts/2015/slug1/index.md',
      load: _.lazyLoad({ body: 'content' }),
    },
    {
      type: Type.A,
      lmod: 1,
      path: 'design/templates/post.html',
      load: _.lazyLoad({ body: 'content' }),
    },

  ]).then(function(changes){

    t.deepEqual(sortedByPath(filesFromCollection(collection)), sortedByPath([
      { lmod: 1, path: 'content/posts/2014/slug1/index.html' },
      { lmod: 1, path: 'content/posts/2015/slug1/index.html' },
      { lmod: 1, path: 'feed.xml' },
      { lmod: 1, path: 'sitemap.xml' },
    ]))

    t.deepEqual(sortedByPath(filesFromChanges(changes)), sortedByPath([
      { type: Type.A, lmod: 1, path: 'content/posts/2014/slug1/index.html' },
      { type: Type.A, lmod: 1, path: 'content/posts/2015/slug1/index.html' },
      { type: Type.A, lmod: 1, path: 'feed.xml' },
      { type: Type.A, lmod: 1, path: 'sitemap.xml' },
    ]))

    return collection
  })
}

Test('setup works', function(t) {
  return add(t)
})

Test('updating a post updates the post page, feed and sitemap', function(t) {
  return add(t).then(function(collection){
    return collection.update([

      {
        type: Type.M,
        lmod: 2,
        path: 'content/posts/2014/slug1/index.md',
        load: _.lazyLoad({ body: 'content' }),
      },

    ]).then(function(changes){

      t.deepEqual(sortedByPath(filesFromCollection(collection)), sortedByPath([
        { lmod: 2, path: 'content/posts/2014/slug1/index.html' },
        { lmod: 1, path: 'content/posts/2015/slug1/index.html' },
        { lmod: 2, path: 'feed.xml' },
        { lmod: 2, path: 'sitemap.xml' },
      ]), 'content')

      t.deepEqual(sortedByPath(filesFromChanges(changes)), sortedByPath([
        { type: Type.M, lmod: 2, path: 'content/posts/2014/slug1/index.html' },
        { type: Type.M, lmod: 2, path: 'feed.xml' },
        { type: Type.M, lmod: 2, path: 'sitemap.xml' },
      ]), 'changes')

    })
  })
})

Test('updating the post template updates all post pages (but not the sitemap or feed)', function(t) {
  return add(t).then(function(collection){
    return collection.update([

      {
        type: Type.M,
        lmod: 2,
        path: 'design/templates/post.html',
        load: _.lazyLoad({ body: 'content' }),
      },

    ]).then(function(changes){

      t.deepEqual(sortedByPath(filesFromCollection(collection)), sortedByPath([
        { lmod: 2, path: 'content/posts/2014/slug1/index.html' },
        { lmod: 2, path: 'content/posts/2015/slug1/index.html' },
        { lmod: 1, path: 'feed.xml' },
        { lmod: 1, path: 'sitemap.xml' },
      ]), 'content')

      t.deepEqual(sortedByPath(filesFromChanges(changes)), sortedByPath([
        { type: Type.M, lmod: 2, path: 'content/posts/2014/slug1/index.html' },
        { type: Type.M, lmod: 2, path: 'content/posts/2015/slug1/index.html' },
      ]), 'changes')

    })
  })
})

Test('deleting a post deletes the post page and updates feed and sitemap', function(t) {
  return add(t).then(function(collection){
    return collection.update([
      { type: Type.D, lmod: 2, path: 'content/posts/2014/slug1/index.md' },

      {
        type: Type.D,
        lmod: 2,
        path: 'content/posts/2014/slug1/index.md',
      },

    ]).then(function(changes){

      t.deepEqual(sortedByPath(filesFromCollection(collection)), sortedByPath([
        { lmod: 1, path: 'content/posts/2015/slug1/index.html' },
        { lmod: 2, path: 'feed.xml' },
        { lmod: 2, path: 'sitemap.xml' },
      ]), 'content')

      t.deepEqual(sortedByPath(filesFromChanges(changes)), sortedByPath([
        { type: Type.D, lmod: 2, path: 'content/posts/2014/slug1/index.html' },
        { type: Type.M, lmod: 2, path: 'feed.xml' },
        { type: Type.M, lmod: 2, path: 'sitemap.xml' },
      ]), 'changes')

    })
  })
})
