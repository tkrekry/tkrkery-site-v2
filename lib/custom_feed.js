// Local forge from https://github.com/hurrymaplelad/metalsmith-feed
const RSS = require('rss')
const extend = require('extend')

module.exports = function customFeeds (options) {
  if (options == null) {
    options = {}
  }

  const limit = options.limit != null ? options.limit : 20
  const destination = options.destination || 'rss.xml'
  const collectionName = options.collection
  if (!collectionName) {
    throw new Error('collection option is required')
  }

  return function (files, metalsmith, done) {
    const metadata = metalsmith.metadata()

    if (!metadata.collections) {
      return done(
        new Error('no collections configured - see metalsmith-collections')
      )
    }

    let collection = metadata.collections[collectionName]

    const feedOptions = extend({}, metadata.site, options, {
      site_url: metadata.site != null ? metadata.site.url : undefined,
      generator: 'metalsmith-feed'
    })

    const siteUrl = feedOptions.site_url
    if (!siteUrl) {
      return done(
        new Error('either site_url or metadata.site.url must be configured')
      )
    }

    if (feedOptions.feed_url == null) {
      feedOptions.feed_url = new URL(destination, siteUrl)
    }

    const feed = new RSS(feedOptions)
    if (limit) {
      collection = collection.slice(0, limit)
    }
    const preprocess = options.preprocess || (file => file)
    let preprocessedItem = null

    for (let file of collection) {
      const itemData = {
        ...file,
        description: file.less || file.excerpt || file.contents
      }
      if (!itemData.url && itemData.path) {
        itemData.url = new URL(itemData.path, siteUrl)
      }
      if (itemData.link) {
        itemData.guid = itemData.url
        itemData.url = itemData.link
      }

      preprocessedItem = preprocess(itemData)
      if (preprocessedItem) {
        feed.item(preprocessedItem)
      }
      preprocessedItem = null
    }

    files[destination] = { contents: Buffer.from(feed.xml(), 'utf8') }

    return done()
  }
}
