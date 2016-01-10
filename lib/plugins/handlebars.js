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
    default: undefined,
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
    context: {}
  }, _options)

  // https://github.com/nknapp/promised-handlebars
  // https://github.com/shannonmoeller/handlebars-layouts

  function deps(f) {
    return [ f, options.partials, options.layouts ].filter(function(d){ return d !== undefined })
  }

  const collection = new Collection('handlebars', deps(files))
  collection.onChange = function(create) {

    const handlebars = Handlebars.create()

    // Handlebars.registerHelper({
    //   foo: function() {
    //   },
    //   bar: function() {
    //   }
    // });
    // Handlebars.registerHelper('link', function(text, url) {
    //   text = Handlebars.Utils.escapeExpression(text);
    //   url  = Handlebars.Utils.escapeExpression(url);
    //   var result = '<a href="' + url + '">' + text + '</a>';
    //   return new Handlebars.SafeString(result);
    // });

    // Handlebars.registerDecorator({
    //   foo: function() {
    //   },
    //   bar: function() {
    //   }
    // });
    // Handlebars.registerDecorator('foo', function() {
    // });

    function loadPartials() {
      if (options.partials) {
        return options.partials.load.then(function(partialFiles) {
          partialFiles.forEach(function(file) {
            const name = Path.parse(file.path).name
            console.log('partial', file.path)
            handlebars.registerPartial(name, file.body.toString())
          })
          return Promise.resolve(partialFiles)
        })
      } else {
        return Promise.resolve([])
      }
    }

    return loadPartials().then(function() {
      return Context.load(options.context)
    }).then(function(loadedContext) {

      files.forEach(function(file) {

        const load = file.load.then(function(doc) {
          const template = handlebars.compile(doc.body.toString(), options.compile)
          const context = _.merge(loadedContext, doc.meta)
          return { body: template(context) }
        })

        create(file.path, load, deps(file) )
      })
    })
  }

  return collection
}}
