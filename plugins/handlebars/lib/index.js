'use strict'

const Xstatic = require('xstatic-core')

const _ = require('@tcurdt/tinyutils')
const Path = require('path')
const Handlebars = require('handlebars')

module.exports = function(project) { return function(files, defaults) {

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
  }, defaults)

  function deps(f) {
    return [ f, options.partials, options.layouts ]
    .concat(Xstatic.context.collections(options.context))
    .filter(function(d) { return d != null })
  }

  const collection = new Xstatic.collection('template', deps(files), options)

  function setup() {
    const handlebars = Handlebars.create()

    // TODO register default helpers
    // load custom helpers
    // e.g. https://github.com/shannonmoeller/handlebars-layouts
    options.helpers.forEach(function(helper) {
      handlebars.registerHelper(helper(handlebars))
    })

    if (options.partials) {
      return options.partials.load.then(function(partialFiles) {
        partialFiles.forEach(function(file) {
          const name = Path.parse(file.path).name
          handlebars.registerPartial(name, file.body.toString())
          // console.log('partial', name)
        })
        return Promise.resolve(handlebars)
      })
    } else {
      return Promise.resolve(handlebars)
    }
  }

  function loadLayout(filename) {
    const layouts = options.layouts || _.throw(`Please specify a 'layouts' option pointing to a collection`)
    const layout = layouts.get(filename) || _.throw(`Could not find layout: ${filename}`)
    return layout.load
  }

  function precompile(doc) {
    return function(handlebars) {
      const template = handlebars.compile(doc.body.toString(), options.compile)
      return Promise.resolve(template)
    }
  }

  function render(context) {
    return function(template) {
      const rendered = template(context)
      return Promise.resolve(rendered)
    }
  }

  collection.onChange = function(create) {

    const engine = setup()
    const contextPromise = Xstatic.context.load(options.context, function(docs) {
      return docs.map(function(doc) { return Xstatic.context.renderContext(project, null, doc, null, null) })
    })

    const cache = {}
    files.forEach(function(file) {

      const contentPromise = Promise.all([file.load, contextPromise]).then(_.spread(function(doc, context) {

        // render page
        const pagePromise = doc.body ? engine.then(precompile(doc))
          .then(render(Xstatic.context.renderContext(project, context, doc)))
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
          body: content
        })
      }))

      create(file.path, docPromise, deps(file))

    })
  }

  return collection
}}
