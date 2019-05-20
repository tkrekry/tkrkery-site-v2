const path = require('path')
const readdirp = require('readdirp')
const s3sync = require('s3-sync-aws')
const level = require('level')
const logging = require('./logging')

module.exports = function (done) {
  const db = level(path.join(__dirname, '../cache'))

  const syncer = s3sync(db, {
    key: process.env.AWS_ACCESS_KEY,
    secret: process.env.AWS_SECRET_KEY,
    bucket: process.env.AWS_BUCKET,
    region: 'eu-central-1',
    concurrency: 256,
    retries: 5,
    cacheSrc: path.join(__dirname, '/.s3-sync-cache'),
    cacheDest: '.s3-sync-cache'
  }).on('data', function (d) {
    logging.info(d.fullPath + ' -> ' + d.url)
  }).on('warn', function (err) {
    logging.error('non-fatal error', err)
    // optionally call stream.destroy() here in order to abort and cause "close" to be emitted
  }).on('error', function (err) {
    logging.error('fatal error', err)
  }).once('end', function () {
    logging.info('uploading new cache')
    done()
  })

  var files = readdirp({
    root: path.join(__dirname, '/build')
  })

  files.pipe(syncer)
}
