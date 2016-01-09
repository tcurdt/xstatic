"use strict"

const Test = require('blue-tape')

const PathChange = require('../lib/path-change')


Test('set ext', function(t) {
  const p1 = new PathChange('a/b/c.md')
  const p2 = p1.setExt('html')
  const p3 = p1.setExt(undefined)

  t.equal(p1.toString(), 'a/b/c.md')
  t.equal(p2.toString(), 'a/b/c.html')
  t.equal(p3.toString(), 'a/b/c')
  t.end()
})

// Test('get ext', function(t) {
//   const p1 = new PathChange('/a/b/c.md')
//
//   t.equal(p1.ext, 'md')
//   t.end()
// })



Test('set file', function(t) {
  const p1 = new PathChange('a/b/c.md')
  const p2 = p1.setFile('d')

  t.equal(p1.toString(), 'a/b/c.md')
  t.equal(p2.toString(), 'a/b/d.md')
  t.end()
})

// Test('get file', function(t) {
//   const p1 = new PathChange('/a/b/c.md')
//
//   t.equal(p1.file, 'c')
//   t.end()
// })



Test('set dir', function(t) {
  const p1 = new PathChange('a/b/c.md')
  const p2 = p1.setDir('e/f')

  t.equal(p1.toString(), 'a/b/c.md')
  t.equal(p2.toString(), 'e/f/c.md')
  t.end()
})

// Test('get dir', function(t) {
//   const p1 = new PathChange('/a/b/c.md')
//
//   t.equal(p1.dir, '/a/b')
//   t.end()
// })



Test('push', function(t) {
  const p1 = new PathChange('a/b/c.md')
  const p2 = p1.push('d/e')

  t.equal(p1.toString(), 'a/b/c.md')
  t.equal(p2.toString(), 'a/b/d/e/c.md')
  t.end()
})


Test('pop', function(t) {
  const p1 = new PathChange('a/b/c.md')
  const p2 = p1.pop()
  const p3 = p1.pop(1)
  const p4 = p1.pop(2)
  const p5 = p1.pop(99)

  t.equal(p1.toString(), 'a/b/c.md')
  t.equal(p2.toString(), 'a/c.md')
  t.equal(p3.toString(), 'a/c.md')
  t.equal(p4.toString(), 'c.md')
  t.equal(p5.toString(), 'c.md')
  t.end()
})


Test('unshift', function(t) {
  const p1 = new PathChange('a/b/c.md')
  const p2 = p1.unshift('c')
  const p3 = p1.unshift('/c')
  const p4 = p1.unshift('/c/d')

  t.equal(p1.toString(), 'a/b/c.md')
  t.equal(p2.toString(), 'c/a/b/c.md')
  t.equal(p3.toString(), '/c/a/b/c.md')
  t.equal(p4.toString(), '/c/d/a/b/c.md')
  t.end()
})


Test('shift', function(t) {
  const p1 = new PathChange('a/b/c.md')
  const p2 = p1.shift()
  const p3 = p1.shift(1)
  const p4 = p1.shift(2)
  const p5 = p1.shift(99)

  t.equal(p1.toString(), 'a/b/c.md')
  t.equal(p2.toString(), 'b/c.md')
  t.equal(p3.toString(), 'b/c.md')
  t.equal(p4.toString(), 'c.md')
  t.equal(p5.toString(), 'c.md')
  t.end()
})
