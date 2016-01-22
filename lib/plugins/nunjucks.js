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

  function deps(f) {
    return [ f, options.partials, options.layouts ].concat(Context.collections(options.context)).filter(function(d){ return d != null })
  }

  function loadLayout(filename) {
    const layouts = options.layouts || _.throw(`Please specify a 'layouts' option pointing to a collection`)
    const layout = layouts.get(filename) || _.throw(`Could not find layout: ${filename}`)
    return layout.load
  }

  function precompile(filename, body) {
    // console.log('nunjucks compiling', filename, body.toString())

    const loader = {
      async: true,
      getSource: function(path, cb) {
        loadLayout(path).then(function(doc) {
          cb(null, {
            src: doc.body.toString(),
            path: path,
            noCache: true
          })
        }).catch(function(err) {
          cb(`Failed to load layout $(path}`)
        })
      }
    }

    const env = new Nunjucks.Environment(loader, options.compile)
    const template = Nunjucks.compile(body.toString(), env, filename)
    return Promise.resolve(template)
  }

  function render(template, context, doc) {
    return new Promise(function(resolve, reject){
      template.render(context, function(err, rendered){
        if (err) {
          reject(err)
        } else {
          resolve(_.merge(doc, {
            body: rendered
          }))
        }
      })
    })
  }

  const collection = new Collection('template', deps(files))
  collection.onChange = function(create) {

    const cache = {}
    files.forEach(function(file){

      const load = Promise.all([ file.load, Context.load(options.context) ]).then(_.spread(function(doc, loadedContext) {

        // render page
        const pagePromise = precompile(file.path, doc.body).then(function(template) {
          const context = _.merge({ site: project.options }, loadedContext, doc.meta)
          return render(template, context, doc)
        })

        const layout = (doc.meta && doc.meta.layout) || options.layout
        if (layout) {
          // get cached template
          const templatePromise = cache[layout] || (function(){
            return cache[layout] = loadLayout(layout).then(function(templateDoc){
              return precompile(layout, templateDoc.body)
            })
          }())
          // pass page to template
          return Promise.all([ pagePromise, templatePromise ]).then(_.spread(function(pageDoc, template) {
            const context = _.merge({ site: project.options }, loadedContext, doc.meta, { content: pageDoc.body })
            return render(template, context, pageDoc)
          }))
        } else {
          return pagePromise
        }
      }))

      create(file.path, load, deps(file))
    })
  }

  return collection
}}
