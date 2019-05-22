const path = require('path')
const Metalsmith = require('metalsmith')
const metalsmithImages = require('metalsmith-project-images')
const metalsmithInPlace = require('metalsmith-in-place')
const metalsmithLayouts = require('metalsmith-layouts')
const metalsmithRequest = require('metalsmith-request')
const metalsmithMetadata = require('metalsmith-metadata')
const metalsmithFilenames = require('metalsmith-filenames')
const metalsmithBeautify = require('metalsmith-beautify')
const metalsmithCleanCss = require('metalsmith-clean-css')
const metalsmithCollections = require('metalsmith-collections')
const metalsmithFeed = require('./custom_feed')
const metalsmithExcerpts = require('metalsmith-excerpts')
const metalsmithSitemap = require('metalsmith-sitemap')
const metalsmithDynamicPages = require('./dynamic_pages')
const slug = require('slug')
const lodash = require('lodash-addons')

const momentFi = require('moment-timezone')
momentFi.tz.setDefault('Europe/Helsinki')
momentFi.locale('fi')

const momentSv = require('moment-timezone')
momentSv.tz.setDefault('Europe/Helsinki')
momentFi.locale('sv')

const sourcePath = path.dirname(path.join(__dirname))

module.exports = new Metalsmith(sourcePath)
  .use(metalsmithImages({}))
  .use(metalsmithFilenames())
  .use(metalsmithMetadata({
    site: 'metadata/site.json'
  }))
  .use(metalsmithRequest({
    domains: 'https://admin.tkrekry.fi/api/organisation/domains',
    districts: 'https://admin.tkrekry.fi/api/organisation/districts',
    advertisements: 'https://admin.tkrekry.fi/api/advertisements/published',
    employers: 'https://admin.tkrekry.fi/api/employers'
  }, {
    json: true
  }))
  .use(metalsmithDynamicPages.plugin({
    advertisementPath: metalsmithDynamicPages.advertisementPath
  }))
  .use((files, ms, done) => {
    Object.keys(files).forEach(function (file) {
      files[file].moment_sv = momentSv
      files[file].moment_fi = momentFi
      files[file].lodash = lodash
      files[file].healthCenterPath = metalsmithDynamicPages.healthCenterPath
      files[file].advertisementPath = metalsmithDynamicPages.advertisementPath
      files[file].slugify = slug
    })

    done()
  })
  .use(metalsmithInPlace({
    pattern: '**/**.pug'
  }))
  .use(metalsmithLayouts({
    engine: 'pug',
    directory: 'templates',
    pattern: [
      '404.html',
      '500.html',
      'avoimet-tyopaikat.html',
      'index.html',
      'tietoja-sivustosta.html',
      'terveyskeskukset.html',
      'toissa-terveyskeskuksessa.html',
      'toissa-terveyskeskuksessa/**.html',
      'terveyskeskukset/**.html',
      'avoimet-tyopaikat/**.html'
    ],
    default: 'fi.pug'
  }))
  .use(metalsmithLayouts({
    engine: 'pug',
    directory: 'templates',
    pattern: [
      'sv/**/**.html'
    ],
    default: 'sv.pug'
  }))
  .use(metalsmithBeautify({
    js: true,
    css: true,
    html: {
      wrap_line_length: 80
    }
  }))
  .use(metalsmithCleanCss({
    files: 'src/styles/*.css',
    cleanCSS: {
      rebase: true
    }
  }))
  .use(metalsmithExcerpts())
  .use(metalsmithCollections({
    advertisements: {
      pattern: 'avoimet-tyopaikat/**.html',
      sortBy: 'date',
      reverse: true
    }
  }))
  .use(metalsmithSitemap({
    hostname: 'https://www.tkrekry.fi'
  }))
  .use(metalsmithFeed({
    collection: 'advertisements',
    title: 'TKrekry - Lääkärien ja hammaslääkärien työpaikkailmoitukset',
    description: 'Lääkärien ja hammaslääkärien avoimet työpaikat terveyskeskuksissa',
    site_url: 'https://www.tkrekry.fi',
    destination: 'feed/rss.xml',
    limit: 200,
    preprocess: (file) => {
      if (file.url) {
        return {
          ...file,
          url: file.url.replace(/\.pug/, '.html'),
          title: file.title.replace('Avoimet työpaikat - Työpaikkailmoitus: ', '')
        }
      }
    }
  }))
