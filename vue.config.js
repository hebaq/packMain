const { defineConfig } = require(`@vue/cli-service`)

module.exports = defineConfig({
  configureWebpack: {
    devtool: `eval-source-map`,
    externals: process.env.production ? {
      '@/browser.js': 'Sys'
    } : {},
  },
  lintOnSave: false,
  productionSourceMap: true,
})
