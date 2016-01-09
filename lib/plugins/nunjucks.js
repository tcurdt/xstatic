"use strict"

const Nunjucks = require('nunjucks')
const Path = require('path')

const Collection = require('../collection')
const _ = require('../utils')

module.exports = function(project) { return function(templates, files, options) {

  options =  _.merge({
    basedir: 'design/templates',
    context: {}
  }, options)

  const collection = new Collection('template', [ templates, files ])

  function load(filename) {
    const template = templates.get(filename) || _.throw('could not find template: ' + filename)
    return template.load
  }

  function precompile(filename, body) {
    // console.log('compiling', filename, body.toString())

    const loader = {
      async: true,
      getSource: function(path, cb) {
        const filepath = Path.join(options.basedir, path)
        // console.log('trying to find', filepath)
        const file = templates.get(filepath)
        if (file) {
          file.load.then(function(doc){
            // console.log('loaded file', filepath, doc.body)
            cb(null, {
              src: doc.body.toString(),
              path: path,
              noCache: true
            })
          })
        } else {
          // console.log('failed to find', filepath)
          cb("could not find template: " + filepath)
        }
      }
    }

    const env = new Nunjucks.Environment(loader, {
      autoescape: false,
      noCache: true,
      trimBlocks: true,
      // throwOnUndefined: true
    })

    const template = Nunjucks.compile(body.toString(), env, filename)

    return Promise.resolve(template)
  }

  collection.onChange = function(create) {

    const cache = {}
    files.forEach(function(file){

      create(file.path, file.load.then(function(doc){

        const pagePromise = precompile(file.path, doc.body).then(function(template) {

          const context = _.merge(options.context, doc.meta)

          return new Promise(function(resolve, reject){

            template.render(context, function(err, res){
              if (err) {
                reject(err)
              } else {
                resolve({
                  body: res
                })
              }
            })

          })
        })

        const layout = (doc.meta && doc.meta.layout) || options.layout
        if (layout) {

          const templatePromise = cache[layout] || function(){
            return cache[layout] = load(layout).then(function(doc){
              return precompile(layout, doc.body)
            })
          }()

          return Promise.all([ pagePromise, templatePromise ]).then(_.spread(function(page, template) {

            const context = _.merge(options.context, doc.meta,{
              content: page.body
            })

            return new Promise(function(resolve, reject){
              template.render(context, function(err, res){
                if (err) {
                  reject(err)
                } else {
                  resolve({
                    body: res
                  })
                }
              })
            })

          }))

        } else {

          return pagePromise
        }

      }),[ file, templates ])

    })
  }

  return collection
}}
