'use strict'

const Xstatic = require('@xstatic/core')
const _ = require('@tcurdt/tinyutils')

// const Archiver = require('archiver')
// const Readable = require('stream').Readable
// const Concat = require('concat-stream')

module.exports = function(project) { return function(files, defaults) {

  const options = _.merge({
    filename: 'output.zip',
  }, defaults)

  const collection = new Xstatic.collection('zip', [ files ], options)

  collection.onChange = function(create) {

    create(options.filename, files.load.then(function(docs){

      // // const buf = new Readable
      // const buf =

      // const zip = Archiver.create(buf)

      // // https://github.com/maxogden/concat-stream/blob/master/index.js
      // // https://github.com/substack/node-buffers
      // // https://github.com/stream-utils/stream-to-array
      // //
      // // const buffers = []
      // // part.on('data', function(buffer) {
      // //   buffers.push(buffer)
      // // })
      // // part.on('end', function() {
      // //   const buffer = Buffer.concat(buffers)
      // //   ...do your stuff...
      // //
      // //   // write to file:
      // //   fs.writeFile('image/' + part.filename, buffer, function(err) {
      // //     // handle error, return response, etc...
      // //   })
      // // })

      // // const zip = Archiver.create(options.filename, {
      // //   // comment: ''
      // // })

      // zip.append('content', {
      //   name: 'test.txt',
      //   date: new Date(),
      //   mode: 0644
      // })

      // zip.finalize(function(err, data){
      //   if (err) throw err

      //   console.log('zipped', data)

      //   // buf.pipe(Concat(function(body){
      //   //   console.log('body', body)
      //   // }))

      // })

      // zip.file(path, { name: filename })
      // zip.append(fs.createReadStream(file1), { name: filename })

    }), [ files ])

  }

  return collection
}}
