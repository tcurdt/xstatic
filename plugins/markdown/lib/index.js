'use strict'

const Xstatic = require('xstatic-core')

const _ = require('@tcurdt/tinyutils')
const Marked = require('marked')
const Highlight = require('highlight.js')

module.exports = function(project) { return function(files, defaults) {

  const renderer = new Marked.Renderer()

  renderer.heading = function (text, level) {
    const token = text.toLowerCase().replace(/[^\w]+/g, '-')
    return '<h' + level + '>'
      + '<a'
      + ' name="' + token + '"'
      + ' class="anchor"'
      + ' href="#' + token + '"'
      + '></a>'
      + text
      + '</h' + level + '>\n'
  }

  renderer.paragraph = function(text) {
    const words = text.split(' ', 6)
    const token = words.map(function(word) {
      return word.toLowerCase().replace(/[^0-9a-z]+/g, 'a').charAt(0)
    }).join('')
    return '<p'
      + ' name="' + token + '"'
      + '>'
      + text
      + '</p>\n'
  }

  renderer.image = function(href, title, text) {
    let out = '<figure>'
    out += '<img src="' + href + '" alt="' + text + '"'
    if (title) {
      out += ' title="' + title + '"'
    }
    out += '/>'
    if (title) {
      out += '<figcaption>' + title + '</figcaption>'
    }
    out += '</figure>'
    return out;
  }

  const options =  _.merge({
    path: function(path) { return path.setExt('html') },
    marked: {
      highlight: function(code, lang) {
        return Highlight.highlightAuto(code).value
      },
      renderer: renderer
    }
  }, defaults)

  const collection = new Xstatic.collection('markdown', [ files ], options)

  function markdown(doc) {
    return new Promise(function(resolve, reject) {

      Marked(doc.body.data.toString(), options.marked, function(err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(_.merge(doc, {
            body: {
              mime: "text/html",
              data: new Buffer(data).toString()
            }
          }))
        }
      })

    })
  }

  collection.build = function(create) {
    return _.collect(function(add) {

      files.forEach(function(file) {
        add(create({
          path: file.path,
          load: file.load.then(markdown),
        }, [ file ]))
      })
    })
  }

  return collection
}}
