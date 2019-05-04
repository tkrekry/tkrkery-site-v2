process.setMaxListeners(0)
require("events").EventEmitter.prototype._maxListeners = 0

const logging = require("./logging")
const metalsmith = require("./metalsmith")
const s3 = require("./s3")
const CronJob = require("cron").CronJob

var generateSite = function() {
  logging.info("Site building started.")
  metalsmith.build(function(error) {
    if (error) {
      logging.info("Build failed, dont sync to s3", error)
      return
    }

    logging.info("Starting to sync s3.")

    s3(function(err, res) {
      if (err) {
        logging.info("S3 sync failed", err)
        return
      }

      logging.info("Site updated.")
    })
  })
}

new CronJob({
  cronTime: "10 */15 * * * *",
  onTick: generateSite,
  start: true
})