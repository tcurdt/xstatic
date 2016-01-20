'use strict'

const Handlebars = require('handlebars')
const Path = require('path')

const Collection = require('../collection')
const Context = require('../context')
const _ = require('../utils')

module.exports = function(project) { return function(files, _options) {

  const options =  _.merge({
    partials: undefined,
    layouts: undefined,
    layout: undefined,
    compile: {
    // data: Set to false to disable @data tracking.
    // compat: Set to true to enable recursive field lookup.
    // knownHelpers: Hash containing list of helpers that are known to exist (truthy) at template execution time. Passing this allows the compiler to optimize a number of cases. Builtin helpers are automatically included in this list and may be omitted by setting that value to false.
    // knownHelpersOnly: Set to true to allow further optimzations based on the known helpers list.
    // trackIds: Set to true to include the id names used to resolve parameters for helpers.
    // noEscape: Set to true to not HTML escape any content.
    // strict: Run in strict mode. In this mode, templates will throw rather than silently ignore missing fields. This has the side effect of disabling inverse operatins such as {{^foo}}{{/foo}} unless fields are explicitly included in the source object.
    // assumeObjects: Removes object existence checks when traversing paths. This is a subset of strict mode that generates optimized templates when the data inputs are known to be safe.
    // preventIndent: By default an indented partial-call causes the output of the whole partial being indented by the same amount. This can lead to unexpected behavior when the partial writes pre-tags. Setting this option to true will disable the auto-indent feature.
    // ignoreStandalone: Disables standalone tag removal when set to true. When set, blocks and partials that are on their own line will not remove the whitespace on that line.
    // explicitPartialContext: Disables implicit context for partials. When enabled, partials that are not passed a context value will execute against an empty object.
    },
    context: {},
    helpers: [],
  }, _options)

  function deps(f) {
    return [ f, options.partials, options.layouts ].filter(function(d){ return d !== undefined })
  }

  function registerHelpers(handlebars) {
    // TODO register default helpers

    // load custom helpers
    // e.g. https://github.com/shannonmoeller/handlebars-layouts
    options.helpers.forEach(function(helper) {
      handlebars.registerHelper(helper(handlebars))
    })
  }

  function registerPartials(handlebars) {
    if (options.partials) {
      return options.partials.load.then(function(partialFiles) {
        partialFiles.forEach(function(file) {
          const name = Path.parse(file.path).name
          handlebars.registerPartial(name, file.body.toString())
          // console.log('partial', name)
        })
        return Promise.resolve(partialFiles)
      })
    } else {
      return Promise.resolve([])
    }
  }

  function loadLayout(filename) {
    const layouts = options.layouts || _.throw(`Please specify a 'layouts' option pointing to a collection`)
    const layout = layouts.get(filename) || _.throw(`Could not find layout: ${filename}`)
    return layout.load
  }

  function precompile(handlebars, filename, body) {
    // console.log('handlebars compiling', filename, body.toString())
    const template = handlebars.compile(body, options.compile)
    return Promise.resolve(template)
  }

  function render(template, context, doc) {
    const rendered = template(context)
    const result = _.merge(doc, {
      body: rendered
    })
    return Promise.resolve(result)
  }

  const collection = new Collection('template', deps(files))
  collection.onChange = function(create) {

    const handlebars = Handlebars.create()
    registerHelpers(handlebars)

    const cache = {}
    files.forEach(function(file){

      const load = Promise.all([file.load, Context.load(options.context), registerPartials(handlebars)]).then(_.spread(function(doc, loadedContext) {

        // render page
        const pagePromise = precompile(handlebars, file.path, doc.body).then(function(template) {
          const context = _.merge({ site: project.options }, loadedContext, doc.meta)
          return render(template, context, doc)
        })

        const layout = (doc.meta && doc.meta.layout) || options.layout
        if (layout) {
          // get cached template
          const templatePromise = cache[layout] || (function(){
            return cache[layout] = loadLayout(layout).then(function(templateDoc){
              return precompile(handlebars, layout, templateDoc.body)
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
