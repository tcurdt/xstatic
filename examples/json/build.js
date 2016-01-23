'use strict'

const xs = require('../../lib')
const project = new xs('build')

const Babel = require('../../lib/plugins/babel')(project)
const Merge = require('../../lib/plugins/merge')(project)
const Filter = require('../../lib/plugins/filter')(project)
const Sitemap = require('../../lib/plugins/sitemap')(project)
const Template = require('../../lib/plugins/handlebars')(project)
const Parser = require('../../lib/plugins/json')(project)
const Glob = project.glob


const layouts = Glob('design/layouts/*.html', { basedir: 'design/layouts' })
const partials = Glob('design/partials/*.html', { basedir: 'design/partials' })
const itemsJson = Parser(Glob('model/items/*.json', { basedir: 'model/items' }))

const itemsHtml = Template(itemsJson, {
  path: function(path){ return path.setExt('html') },
  partials: partials,
  layouts: layouts,
  layout: 'item.html',
})

const assets = Glob('assets/**/*.+(js|jpg|png|ttf|css)', { basedir: 'assets' })
const content = Merge([ itemsHtml ])
const sitemap = Sitemap(content)

// const html = Glob('html/**/*.html', { basedir: 'html' })
// const javascript = Babel(Glob('app/**/*.+(js|jsx)'))
// const bundles = Filter('**/*.js', [ javascript ])

project.watch(Merge([ assets, sitemap, content ]))

