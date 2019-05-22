const logging = require('./logging')
const metalsmith = require('./metalsmith')
const s3 = require('./s3')
const CronJob = require('cron').CronJob

const generateSite = function generateSite() {
  logging.info('Site building started.')
  metalsmith.build((error) => {
    if (error) {
      logging.info('Build failed, dont sync to s3', error)
      return
    }

    logging.info('Starting to sync s3.')

    s3((error) => {
      if (error) {
        logging.info('S3 sync failed', error)
        return
      }

      logging.info('Site updated.')
    })
  })
}

new CronJob({
  cronTime: '10 */15 * * * *',
  onTick: generateSite,
  start: true
})