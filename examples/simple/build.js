'use strict'

const Xstatic = require('xstatic-core')
const project = new Xstatic('build', {
  title: 'TITLE'
})

const Glob = project.glob
const Frontmatter = require('xstatic-frontmatter')(project)
const Template = require('xstatic-handlebars')(project)
const Merge = require('xstatic-merge')(project)
const Css = require('xstatic-css')(project)

const css = Css(Glob('design/assets/**/*', { basedir: 'design/assets' }))
const pages = Frontmatter(Glob('pages/*.html', { basedir: 'pages' }))
const partials = Glob('design/partials/**/*.html', { basedir: 'design/partials' })

const html = Template(pages, {
  partials: partials,
  context: { pages: pages }
})

project.build(Merge([ html, css ]))
// project.watch(Merge([ html, css ]))
