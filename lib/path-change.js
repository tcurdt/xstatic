'use strict'

const Path = require('path')

function PathChange(path) {
  this.path = path
  return this
}

PathChange.prototype.pop = function(n) {
  if (n === undefined) n = 1
  const segments = this.path.split('/')
  const file = segments.pop()
  for(let i=0; i<n; i++) {
    segments.pop()
  }
  segments.push(file)
  return segments.join('/')
}

PathChange.prototype.push = function(dir) {
  const parts = Path.parse(this.path)
  return new PathChange(Path.join(parts.dir, dir, parts.base))
}


PathChange.prototype.shift = function(n) {
  if (n === undefined) n = 1
  const segments = this.path.split('/')
  for(let i=0; i<Math.min(n, segments.length); i++) {
    segments.shift()
  }
  return segments.join('/')
}

PathChange.prototype.unshift = function(dir) {
  const parts = Path.parse(this.path)
  return new PathChange(Path.join(dir, parts.dir, parts.base))
}


PathChange.prototype.setExt = function(ext) {
  const x = (ext && ext[0] !== '.')
    ? '.' + ext
    : ext || ''
  const parts = Path.parse(this.path)
  return new PathChange(Path.join(parts.dir, parts.name + x))
}

PathChange.prototype.setFile = function(name) {
  const parts = Path.parse(this.path)
  return new PathChange(Path.join(parts.dir, name + parts.ext))
}

PathChange.prototype.setDir = function(dir) {
  const parts = Path.parse(this.path)
  return new PathChange(Path.join(dir, parts.base))
}

PathChange.prototype.toString = function() {
  return this.path
}

module.exports = PathChange
