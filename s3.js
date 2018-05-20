process.setMaxListeners(9999999999)
require("events").EventEmitter.prototype._maxListeners = 9999999999

var path = require("path")
var readdirp = require("readdirp")
var s3sync = require("s3-sync-aws")
var level = require("level")
var db = level(path.join(__dirname, "/cache"))

module.exports = function(done) {
  var syncer = s3sync(db, {
    key: process.env.AWS_ACCESS_KEY,
    secret: process.env.AWS_SECRET_KEY,
    bucket: process.env.AWS_BUCKET,
    region: 'eu-central-1',
    concurrency: 256,
    retries: 5,
    cacheSrc: path.join(__dirname, "/.s3-sync-cache"),
    cacheDest: '.s3-sync-cache'
  }).on("data", function(d) {
    console.log(d.fullPath + " -> " + d.url)
  }).on("warn", function(err) {
    console.error("non-fatal error", err)
      // optionally call stream.destroy() here in order to abort and cause "close" to be emitted
  }).on("error", function(err) {
    console.error("fatal error", err)
  }).once("end", function() {
    console.log("uploading new cache")
    done()
  })

  var files = readdirp({
    root: path.join(__dirname, "/build")
  })

  files.pipe(syncer)
}
