process.setMaxListeners(0)
require("events").EventEmitter.prototype._maxListeners = 0


if (process.env.NEW_RELIC_LICENSE_KEY) {
  console.log("NewRelic: ON")
  require("newrelic")
}


var metalsmith = require("./metalsmith")
var s3 = require("./s3")

var generateSite = function() {
  console.log("Site building started.")
  metalsmith.build(function (error) {
    if (error) {
      console.log("Build failed, dont sync to s3", error)
      return
    }

    console.log("Starting to sync s3.")

    s3(function(err, res) {
      if (err) {
        console.log("S3 sync failed", err)
        return
      }

      console.log("Site updated.")

    })
  })
}


var CronJob = require("cron").CronJob
new CronJob({
  cronTime: "10 */5 * * * *",
  onTick: generateSite,
  start: true
})
