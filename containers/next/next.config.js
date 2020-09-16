const withPlugins = require("next-compose-plugins")
//const sass = require('@zeit/next-sass')
const withSvgr = require("next-svgr")

module.exports = withPlugins([
    withSvgr, /*
    [sass,
        {
            cssModules: true,
            cssLoaderOptions: {
                localIdentName: '[local]___[hash:base64:5]',
            }
        }
    ]*/
])

