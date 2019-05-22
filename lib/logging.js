module.exports.info = function info (...logs) {
  // eslint-disable-next-line no-console
  console.log.apply(console, ['info:'].concat(logs))
}

module.exports.warn = function warn (...logs) {
  // eslint-disable-next-line no-console
  console.warn.apply(console, ['warn:'].concat(logs))
}

module.exports.error = function error (...logs) {
  // eslint-disable-next-line no-console
  console.error.apply(console, ['error:'].concat(logs))
}