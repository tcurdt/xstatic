'use strict'

const Changes = require('./changes')

const Glob = require('../lib/glob')
const Collection = require('../lib/collection')

Changes(function(t, cb) {
  return cb(new Glob('content/**/*'))
})
