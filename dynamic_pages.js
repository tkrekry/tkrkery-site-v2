var _ = require("lodash-addons")
var slug = require("slug")
var moment = require("moment")
var slugConfig = slug.defaults.modes["pretty"]

function createPages(files, sourceFileName, filePathFn, counterPartFn, collection, counterLang, langPrefixed) {
  collection.forEach(function(item) {
    var page = _.cloneDeep(files[sourceFileName], function(value) {
      if (value instanceof Buffer) {
        return new Buffer(value)
      }
    })
    var filePath = filePathFn(item)
    var counterPart = counterPartFn(item)

    if (!page.title) {
      page.title = langPrefixed + ": " +
                    [_.get(item, "title"),
                     _.get(item, "name"),
                     _.get(item, "employer.name"),
                     _.get(item, "office.locality")].join(" ")
    }

    if (!page.description) {
      page.description = langPrefixed + ": " +
                          [_.get(item, "title"),
                           _.get(item, "name"),
                           _.get(item, "employer.name"),
                           _.get(item, "office.locality")].join(" ")
    }

    page = _.merge(page, {
      changefreq: "daily",
      lastmod: moment().format("YYYY-MM-DD"),
      priority: 1.0,
      filename: filePath,
      counterPart: "/" + counterPart,
      counterLang: counterLang,
      slug: "/" + filePath,
      item: item,
      url: "https://www.tkrekry.fi/" + filePath,
      baseUrl: "https://www.tkrekry.fi"
    })
    files[filePath] = page
  })

  delete files[sourceFileName]
  return files
}

var healthCenterFilePathFN = function(prefix, hc) {
  return ([prefix, slug([hc.name, hc._id].join("-"), slugConfig)].join("/") + ".html").toLowerCase()
}

var advertisementFilePathFN = function(prefix, advertisement) {
  return ([prefix,
           slug([advertisement.title,
                 advertisement.office.locality,
                 advertisement.job_profession_group.id,
                 advertisement.job_type.id,
                 advertisement.job_duration.id,
                 advertisement._id].join(' '), slugConfig)].join("/") + ".html").toLowerCase()
}

function plugin(opts){
  return function(files, metalsmith, done){
    var metadata = metalsmith.metadata()
    createPages(files,
                "avoimet-tyopaikat/avoin-tyopaikka.html",
                _.partial(advertisementFilePathFN, "avoimet-tyopaikat"),
                _.partial(advertisementFilePathFN, "sv/lediga-jobb"),
                metadata.advertisements,
                "fi",
                "Avoimet työpaikat - Työpaikkailmoitus")

    createPages(files,
                "sv/lediga-jobb/lediga-jobb.html",
                _.partial(advertisementFilePathFN, "sv/lediga-jobb"),
                _.partial(advertisementFilePathFN, "avoimet-tyopaikat"),
                metadata.advertisements,
                "sv",
                "Lediga jobb - Platsannons")


    createPages(files,
                "terveyskeskukset/terveyskeskus.html",
                _.partial(healthCenterFilePathFN, "terveyskeskukset"),
                _.partial(healthCenterFilePathFN, "sv/halsovardscentralen"),
                metadata.employers,
                "fi",
                "Rekrytoinnista vastaavat yhteyshenkilöt, koulutusvalmiudet, esittely ja toimipisteet")

    createPages(files,
                "sv/halsovardscentralen/vardcentral.html",
                _.partial(healthCenterFilePathFN, "sv/halsovardscentralen"),
                _.partial(healthCenterFilePathFN, "terveyskeskukset"),
                metadata.employers,
                "sv",
                "Kontaktpersoner för rekrytering, utbildningsberedskap, presentation och verksamhetsställen")

    done()
  }
}

module.exports = {
  plugin: plugin,
  advertisementPath: advertisementFilePathFN,
  healthCenterPath: healthCenterFilePathFN
}
