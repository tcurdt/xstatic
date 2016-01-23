'use strict'

const Nunjucks = require('nunjucks')
const Path = require('path')

const Collection = require('../collection')
const Context = require('../context')
const _ = require('../utils')

module.exports = function(project) { return function(files, _options) {

  const options =  _.merge({
    layouts: undefined,
    layout: undefined,
    compile: {
      autoescape: false,
      noCache: true,
      trimBlocks: true,
      // throwOnUndefined: true,
    },
    context: {},
  }, _options)

  const collection = new Collection('template', deps(files), options)

  function deps(f) {
    return [ f, options.partials, options.layouts ].concat(Context.collections(options.context)).filter(function(d){ return d != null })
  }

  function setup() {
    return Promise.resolve()
  }

  function loadLayout(filename) {
    const layouts = options.layouts || _.throw(`Please specify a 'layouts' option pointing to a collection`)
    const layout = layouts.get(filename) || _.throw(`Could not find layout: ${filename}`)
    return layout.load
  }

  function precompile(doc) {
    return function() {

      const loader = {
        async: true,
        getSource: function(path, cb) {
          loadLayout(path).then(function(loaderDoc) {
            cb(null, {
              src: loaderDoc.body.toString(),
              path: path,
              noCache: true
            })
          }).catch(function(err) {
            cb(`Failed to load layout $(path}`)
          })
        }
      }

      const env = new Nunjucks.Environment(loader, options.compile)
      const template = Nunjucks.compile(doc.body.toString(), env, doc.path)
      return Promise.resolve(template)
    }
  }

  function render(context) {
    return function(template) {
      return new Promise(function(resolve, reject){
        template.render(context, function(err, rendered){
          if (err) {
            reject(err)
          } else {
            resolve(rendered)
          }
        })
      })
    }
  }

  collection.onChange = function(create) {

    const engine = setup()
    const contextPromise = Context.load(options.context, function(docs) {
      return docs.map(function(doc) { return _.renderContext(project, null, doc, null, null) })
    })

    const cache = {}
    files.forEach(function(file){

      const contentPromise = Promise.all([file.load, contextPromise]).then(_.spread(function(doc, context) {

        // render page
        const pagePromise = doc.body ? engine.then(precompile(doc))
          .then(render(_.renderContext(project, context, doc)))
          : Promise.resolve(doc.json)

        const layout = (doc.meta && doc.meta.layout) || options.layout
        if (layout) {

          // get cached template
          const templatePromise = cache[layout] || (function() {
            return cache[layout] = loadLayout(layout).then(function(templateDoc) {
              return engine.then(precompile(templateDoc))
            })
          }())

          // pass page to template
          return pagePromise.then(function(page) {
            return templatePromise.then(render(_.renderContext(project, context, doc, {
              content: page
            })))
          })

        } else {
          return pagePromise
        }

      }))

      // build doc
      const docPromise = Promise.all([file.load, contentPromise]).then(_.spread(function(doc, content) {
        return _.merge(doc, {
          body: content
        })
      }))

      create(file.path, docPromise, deps(file))
    })
  }

  return collection
}}
