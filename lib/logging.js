module.exports.info = function info(...logs) {
  console.log.apply(console, ['info:'].concat(logs))
}