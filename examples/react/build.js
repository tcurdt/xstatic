"use strict"

const xs = require('../../lib')
const project = new xs('build')

const Babel = require('../../lib/plugins/babel')(project)
const Merge = require('../../lib/plugins/merge')(project)
const Filter = require('../../lib/plugins/filter')(project)
const Glob = project.glob

const html = Glob('html/**/*.html', { basedir: 'html' })
const assets = Glob('assets/**/*.+(js|jpg|png|ttf|css)', { basedir: 'assets' })
const javascript = Babel(Glob('app/**/*.+(js|jsx)'))
const bundles = Filter('**/*.js', [ javascript ])

// project.watch(html)
project.watch(Merge([ html, assets, bundles ]))

