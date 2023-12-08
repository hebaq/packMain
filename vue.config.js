const { defineConfig } = require(`@vue/cli-service`)

module.exports = defineConfig({
  configureWebpack: {
    devtool: `eval-source-map`,
  },
  lintOnSave: false,
  productionSourceMap: true,
})
