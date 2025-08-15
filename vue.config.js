'use strict'
module.exports = {
  publicPath: '/',
  devServer: {
    open: false,
    disableHostCheck: true,
    host: '0.0.0.0',
    port: 8080,
    https: false,
    hotOnly: false,
    proxy: process.env.VUE_APP_API_URL,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
}
