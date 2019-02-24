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
                     "-",
                     _.get(item, "employer.name") + ",",
                     _.get(item, "office.locality")].join(" ")
    }

    if (!page.description) {
      page.description = langPrefixed + ": " +
                          [_.get(item, "title"),
                           _.get(item, "name"),
                           "-",
                           _.get(item, "employer.name") + ",",
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

var healthCenterFilePathFN = (prefix, hc, ext = "html") => {
  return ([prefix, slug([hc.name, hc._id].join("-"), slugConfig)].join("/") + "." + ext).toLowerCase()
}

var advertisementFilePathFN = (prefix, advertisement, ext = "html") => {
  return ([prefix,
           slug([advertisement.title,
                 _.get(advertisement, "office.locality"),
                 _.get(advertisement, "job_profession_group.id"),
                 _.get(advertisement, "job_type.id"),
                 _.get(advertisement, "job_duration.id"),
                 advertisement._id].join(' '), slugConfig)].join("/") + "." + ext).toLowerCase()
}

function plugin(opts){
  return function(files, metalsmith, done){
    var metadata = metalsmith.metadata()
    createPages(files,
                "avoimet-tyopaikat/avoin-tyopaikka.pug",
                (ad) => advertisementFilePathFN("avoimet-tyopaikat", ad, "pug"),
                (ad) => advertisementFilePathFN("sv/lediga-jobb", ad, "html"),
                metadata.advertisements,
                "fi",
                "Avoimet työpaikat - Työpaikkailmoitus")

    createPages(files,
                "sv/lediga-jobb/lediga-jobb.pug",
                (ad) => advertisementFilePathFN("sv/lediga-jobb", ad, "pug"),
                (ad) => advertisementFilePathFN("avoimet-tyopaikat", ad, "html"),
                metadata.advertisements,
                "sv",
                "Lediga jobb - Platsannons")

    createPages(files,
                "terveyskeskukset/terveyskeskus.pug",
                (hc) => healthCenterFilePathFN("terveyskeskukset", hc, "pug"),
                (hc) => healthCenterFilePathFN("sv/halsovardscentralen", hc, "html"),
                metadata.employers,
                "fi",
                "Rekrytoinnista vastaavat yhteyshenkilöt, koulutusvalmiudet, esittely ja toimipisteet")

    createPages(files,
                "sv/halsovardscentralen/vardcentral.pug",
                (hc) => healthCenterFilePathFN("sv/halsovardscentralen", hc, "pug"),
                (hc) => healthCenterFilePathFN("terveyskeskukset", hc, "html"),
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
