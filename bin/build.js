/**
 * @file
 */

var config = require('./webpack.config.prod.js')
var configSit = require('./webpack.config.sit.js')
var webpack = require('webpack')

webpack(config, function(err, stats) {
  if (err) console.log(err)
})

webpack(configSit, function(err, stats) {
  if (err) console.log(err)
})
