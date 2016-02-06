// Handlebars.registerHelper('excerpt', function(contents) {
//     if (typeof contents !== 'string') return '';
//     var text = striptags(contents),
//         words = text.split(' ');
//     if (words.length >= 55) {
//         text = words.slice(0, 55).join(' ') + ' [&hellip;]';
//     }
//     return new Handlebars.SafeString('<p>' + text + '</p>');
// });

// Handlebars.registerHelper('moment', function(date, format) {
//     return Moment(date).format(format);
// });

// Handlebars.registerHelper('link', function(text, url) {
//   text = Handlebars.Utils.escapeExpression(text);
//   url  = Handlebars.Utils.escapeExpression(url);
//   var result = '<a href="' + url + '">' + text + '</a>';
//   return new Handlebars.SafeString(result);
// });


// handlebars.registerHelper('eachSort', function(array, key, opts) {
//     // zip for sorting
//     var zipped = []
//     for (var i = 0; i < array.length; i++) {
//         zipped.push({
//             originalData: array[i],
//             originalIndex: i
//         })
//     }
//     // sort
//     var sorted = _.sortBy(zipped, function(item) {
//         return item.originalData[key]
//     })
//     // custom each
//     var result = ''
//     for (var i = 0; i < sorted.length; i++) {
//         var item = sorted[i]
//         // set metadata as @data variables
//         opts.data.index = i
//         opts.data.originalIndex = item.originalIndex
//         result += opts.fn(item.originalData, opts)
//     }
//     return result
// })

// {{#eachSort . 'name'}}
// name={{name}}=  / index_now={{@index}}= / index_org={{@originalIndex}}= <br/>
// {{/eachSort}}

// handlebars.registerHelper('eachSort', function(array, key, opts) {
//     // zip for sorting
//     var zipped = []
//     for (var i = 0; i < array.length; i++) {
//         zipped.push({
//             originalData: array[i],
//             originalIndex: i
//         })
//     }
//     // sort
//     var sorted = _.sortBy(zipped, function(item) {
//         return item.originalData[key]
//     })
//     // separate sorted data
//     var originalData = []
//     var originalIndex = []
//     for (var i = 0; i < sorted.length; i++) {
//         var item = sorted[i]
//         originalData.push(item.originalData)
//         originalIndex.push(item.originalIndex)
//     }
//     // set original index metadata generator as @data variable
//     opts.data.originalIndex = function() {
//         return originalIndex.shift()
//     }
//     // default each
//     return handlebars.helpers.each(originalData, opts)
// })

// Object.defineProperty( context, 'commentsByIdx', {
//     get: function() {
//         return this.comments.concat()
//             .sort( function(a,b) { return a.idx - b.idx } );
//     }
// });