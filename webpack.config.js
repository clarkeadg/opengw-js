const webpack = require('webpack');

module.exports = {
    entry: './js/gw/main.js',
    output: {
        path: './dist',
        filename: 'opengw.js'
    },
    module: {
        loaders: [{
            test: /\.js?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015']
            }
        }]
    },
    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                drop_console: true
            },
            output: {
                comments: false
            }
        }),
        new webpack.optimize.AggressiveMergingPlugin()
    ]
}