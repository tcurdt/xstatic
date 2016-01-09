"use strict"

const Marked = require('marked')
const Highlight = require('highlight')

const Collection = require('../collection')
const _ = require('../utils')

module.exports = function(project) { return function(files, options) {

  const renderer = new Marked.Renderer()
  options =  _.merge({
    path: function(path){ return path.setExt('html') },
    marked: {
      highlight: function(code, lang) {
        return Highlight.highlightAuto(code).value
      },
      renderer: renderer
    }
  }, options)

  const collection = new Collection('markdown', [ files ], options)

  function markdown(doc) {
    return new Promise(function(resolve, reject) {

      Marked(doc.body.toString(), options.marked, function(err, data) {
        if (err) {
          reject(err)
        } else {
          resolve({
            meta: doc.meta,
            body: new Buffer(data).toString()
          })
        }
      })

    })
  }

  collection.onChange = function(create) {

    files.forEach(function(file){

      const load = file.load.then(markdown)

      create(file.path, load, [ file ])

    })
  }

  return collection
}}
