'use strict'

const Xstatic = require('../../lib')
const project = new Xstatic('build')

const Glob = project.glob
const Template = require('../../lib/plugins/handlebars')(project)
const Merge = require('../../lib/plugins/merge')(project)
const Css = require('../../lib/plugins/css')(project)

const css = Css(Glob('design/assets/**/*', { basedir: 'design/assets' }))
const pages = Glob('pages/*.html', { basedir: 'pages' })
const partials = Glob('design/partials/**/*.html', { basedir: 'design/partials' })

const html = Template(pages, {
  partials: partials,
  context: { pages: pages }
})

project.build(Merge([ html, css ]))
// project.watch(Merge([ html, css ]))
