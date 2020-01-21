const path = require('path');
const ArcGISPlugin = require("@arcgis/webpack-plugin");
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');

module.exports = {
    entry: {
        'main': './src/main.ts'
    },
    mode: "development",
    context: __dirname,
    // entry: './assets/js/index',
    output: {
        path: path.resolve('./static/dist/'),
        filename: "[name]-[hash].js",
        publicPath: "/static/dist/"
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    // output: {
    //     filename: 'bundle.js',
    //     path: path.resolve(__dirname, 'static', 'dist'),
    // },
    node: {
        process: false,
        global: false,
        fs: 'empty'
    },
    optimization: {},
    plugins: [new ArcGISPlugin(
        {
            locales: ["en", "ru"],
        }
    ),
        new BundleTracker({filename: './webpack-stats.json'})
    ]
};