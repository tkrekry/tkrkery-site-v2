var path = require("path")
var Metalsmith = require("metalsmith")
var metalsmith_permalinks = require("metalsmith-permalinks")
var metalsmith_in_place = require("metalsmith-in-place")
var metalsmith_layouts = require("metalsmith-layouts")
var metalsmith_browser_sync = require("metalsmith-browser-sync")
var metalsmith_request = require("metalsmith-request")
var metalsmith_metadata = require("metalsmith-metadata")
var metalsmith_filenames = require("metalsmith-filenames")
var metalsmith_beautify = require("metalsmith-beautify")
var metalsmith_clean_css = require("metalsmith-clean-css")
var metalsmith_collections = require("metalsmith-collections")
var metalsmith_feed = require("metalsmith-feed")
var metalsmith_excerpts = require("metalsmith-excerpts")
var metalsmith_sitemap = require("metalsmith-sitemap")
var metalsmith_dynamic_pages = require("./dynamic_pages")
var slug = require("slug")

var moment_fi = require("moment")
moment_fi.locale("fi")

var moment_sv = require("moment")
moment_fi.locale("sv")

var lodash = require("lodash-addons")

module.exports = new Metalsmith(__dirname)
  .use(metalsmith_filenames())
  .use(metalsmith_metadata({
    site: "metadata/site.json"
  }))
  .use(metalsmith_request({
    domains: "https://admin.tkrekry.fi/api/organisation/domains",
    districts: "https://admin.tkrekry.fi/api/organisation/districts",
    advertisements: "https://admin.tkrekry.fi/api/advertisements/published",
    employers: "https://admin.tkrekry.fi/api/employers"
  }, {
    json: true
  }))
  .use(metalsmith_dynamic_pages.plugin({
    advertisementPath: metalsmith_dynamic_pages.advertisementPath
  }))
  .use(metalsmith_in_place({
    engine: "jade",
    pattern: "**/**.html",
    moment_sv: moment_sv,
    moment_fi: moment_fi,
    lodash: lodash,
    healthCenterPath: metalsmith_dynamic_pages.healthCenterPath,
    advertisementPath: metalsmith_dynamic_pages.advertisementPath,
    slugify: slug
  }))
  .use(metalsmith_layouts({
    engine: "jade",
    directory: "templates",
    pattern: ["404.html",
      "500.html",
      "avoimet-tyopaikat.html",
      "index.html",
      "tietoja-sivustosta.html",
      "terveyskeskukset.html",
      "toissa-terveyskeskuksessa.html",
      "toissa-terveyskeskuksessa/**.html",
      "terveyskeskukset/**.html",
      "avoimet-tyopaikat/**.html"
    ],
    moment_sv: moment_sv,
    moment_fi: moment_fi,
    lodash: lodash,
    healthCenterPath: metalsmith_dynamic_pages.healthCenterPath,
    advertisementPath: metalsmith_dynamic_pages.advertisementPath,
    default: "fi.jade",
    slugify: slug
  }))
  .use(metalsmith_layouts({
    engine: "jade",
    directory: "templates",
    pattern: [
      "sv/**/**.html"
    ],
    moment_sv: moment_sv,
    moment_fi: moment_fi,
    lodash: lodash,
    healthCenterPath: metalsmith_dynamic_pages.healthCenterPath,
    advertisementPath: metalsmith_dynamic_pages.advertisementPath,
    default: "sv.jade",
    slugify: slug
  }))
  .use(metalsmith_beautify({
    js: true,
    css: true,
    html: {
      wrap_line_length: 80
    }
  }))
  .use(metalsmith_clean_css({
    files: "src/styles/*.css",
    cleanCSS: {
      rebase: true
    }
  }))
  .use(metalsmith_excerpts())
  .use(metalsmith_collections({
    advertisements: {
      pattern: 'avoimet-tyopaikat/**.html',
      sortBy: 'date',
      reverse: true
    }
  }))
  .use(metalsmith_sitemap({
    hostname: "https://www.tkrekry.fi"
  }))
  .use(metalsmith_feed({
    collection: "advertisements",
    title: "TKrekry - Lääkärien ja hammaslääkärien työpaikkailmoitukset",
    description: "Lääkärien ja hammaslääkärien avoimet työpaikat terveyskeskuksissa",
    site_url: "https://www.tkrekry.fi",
    destination: "feed/rss.xml",
    limit: 200
  }))
