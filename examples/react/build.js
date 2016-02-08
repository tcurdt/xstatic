'use strict'

const Xstatic = require('xstatic-core')
const project = new Xstatic('build')

const Babel = require('xstatic-babel')(project)
const Merge = require('xstatic-merge')(project)
const Filter = require('xstatic-filter')(project)
const Glob = project.glob

const html = Glob('html/**/*.html', { basedir: 'html' })
const assets = Glob('assets/**/*.+(js|jpg|png|ttf|css)', { basedir: 'assets' })
const javascript = Babel(Glob('app/**/*.+(js|jsx)'))
const bundles = Filter('**/*.js', [ javascript ])

// project.watch(html)
project.watch(Merge([ html, assets, bundles ]))

