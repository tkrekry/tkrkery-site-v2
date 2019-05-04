var path = require("path")
var Metalsmith = require("metalsmith")
var metalsmith_images = require("metalsmith-project-images")
var metalsmith_permalinks = require("metalsmith-permalinks")
var metalsmith_in_place = require("metalsmith-in-place")
var metalsmith_layouts = require("metalsmith-layouts")
var metalsmith_request = require("metalsmith-request")
var metalsmith_metadata = require("metalsmith-metadata")
var metalsmith_filenames = require("metalsmith-filenames")
var metalsmith_beautify = require("metalsmith-beautify")
var metalsmith_clean_css = require("metalsmith-clean-css")
var metalsmith_collections = require("metalsmith-collections")
var metalsmith_feed = require("./custom_feed")
var metalsmith_excerpts = require("metalsmith-excerpts")
var metalsmith_sitemap = require("metalsmith-sitemap")
var metalsmith_dynamic_pages = require("./dynamic_pages")
var slug = require("slug")

var moment_fi = require("moment-timezone")
moment_fi.tz.setDefault("Europe/Helsinki")
moment_fi.locale("fi")

var moment_sv = require("moment-timezone")
moment_sv.tz.setDefault("Europe/Helsinki")
moment_fi.locale("sv")

var lodash = require("lodash-addons")

module.exports = new Metalsmith(__dirname)
  .use(metalsmith_images({}))
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
  .use((files, ms, done) => {
    Object.keys(files).forEach(function(file) {
      files[file].moment_sv = moment_sv;
      files[file].moment_fi = moment_fi;
      files[file].lodash = lodash;
      files[file].healthCenterPath = metalsmith_dynamic_pages.healthCenterPath;
      files[file].advertisementPath = metalsmith_dynamic_pages.advertisementPath;
      files[file].slugify = slug;
    })

    done();
  })
  .use(metalsmith_in_place({
    pattern: "**/**.pug"
  }))
  .use(metalsmith_layouts({
    engine: "pug",
    directory: "templates",
    pattern: [
      "404.html",
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
    default: "fi.pug"
  }))
  .use(metalsmith_layouts({
    engine: "pug",
    directory: "templates",
    pattern: [
      "sv/**/**.html"
    ],
    default: "sv.pug"
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
    limit: 200,
    preprocess: (file) => {
      if (file.url) {
        return {
          ...file,
          url: file.url.replace(/\.pug/, ".html"),
          title: file.title.replace("Avoimet työpaikat - Työpaikkailmoitus: ", "")
        };
      }
    }
  }))