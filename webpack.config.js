const path = require('path');
const ArcGISPlugin = require("@arcgis/webpack-plugin");
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

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
                loader: 'ts-loader',
                //exclude: /node_modules/,
                options: {
                    appendTsSuffixTo: [/\.vue$/],

                }
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        ts: 'ts-loader'
                    },
                    esModule: true
                }
            },
            //sass
            {
                test: /\.scss$/,
                loaders: [
                    'style-loader',
                    'css-loader',
                    'resolve-url-loader',
                    {
                        loader: 'sass-loader?indentedSyntax=false',
                        options: {
                            sourceMap: true
                        },
                    },
                ],
            },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|gif|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader'
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
            root: "./static/dist",
            // exclude modules you do not need
            //TODO настроить
            userDefinedExcludes: [
                "arcgis-js-api/layers/BingMapsLayer",
                "arcgis-js-api/layers/CSVLayer",
                "arcgis-js-api/layers/GeoRSSLayer",
                "arcgis-js-api/layers/ImageryLayer",
                "arcgis-js-api/layers/KMLLayer",
                "arcgis-js-api/layers/MapImageLayer",
                "arcgis-js-api/layers/OpenStreetMapLayer",
                "arcgis-js-api/layers/StreamLayer",
                "arcgis-js-api/layers/WMSLayer",
                "arcgis-js-api/layers/WMTSLayer",
                "arcgis-js-api/layers/WebTileLayer"
            ]
        }
    ),
        new BundleTracker({filename: './webpack-stats.json'}),
        new VueLoaderPlugin(),
    ]
};