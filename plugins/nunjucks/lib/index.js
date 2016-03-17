'use strict'

const Xstatic = require('xstatic-core')
const _ = require('@tcurdt/tinyutils')

const Nunjucks = require('nunjucks')

const Path = require('path')

module.exports = function(project) { return function(files, defaults) {

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
  }, defaults)

  function deps(f) {
    return [ f, options.partials, options.layouts ]
    .concat(Xstatic.context.collections(options.context))
    .filter(function(d) { return d != null })
  }

  const collection = new Xstatic.collection('template', deps(files), options)

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
              src: loaderDoc.body.data.toString(),
              path: path,
              noCache: true
            })
          }).catch(function(err) {
            cb(`Failed to load layout $(path}`)
          })
        }
      }

      const env = new Nunjucks.Environment(loader, options.compile)
      const template = Nunjucks.compile(doc.body.data.toString(), env, doc.file.path)
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

  collection.build = function(create) {
    return _.collect(function(add) {

      const engine = setup()
      const contextPromise = Xstatic.context.load(options.context, function(docs) {
        return docs.map(function(doc) { return Xstatic.context.renderContext(project, null, doc, null, null) })
      })

      const cache = {}
      files.forEach(function(file){

        const contentPromise = Promise.all([file.load, contextPromise]).then(_.spread(function(doc, context) {

          // render page
          const pagePromise = doc.body.mime === 'object/json'
            ? Promise.resolve(doc.body.data)
            : engine.then(precompile(doc)).then(render(Xstatic.context.renderContext(project, context, doc)))

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
              return templatePromise.then(render(Xstatic.context.renderContext(project, context, doc, {
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
            body: {
              mime: 'text/any',
              data: content
            }
          })

        }))

        add(create({
          path: file.path,
          load: docPromise,
        }, deps(file)))
      })
    })
  }

  return collection
}}
