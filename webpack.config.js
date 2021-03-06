const path = require('path');
const ArcGISPlugin = require("@arcgis/webpack-plugin");
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');
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
        filename: "[name].js",
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
                    'vue-style-loader',
                    'style-loader',
                    'css-loader',
                    {loader: 'resolve-url-loader', options: {"removeCR": true}},
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true,
                            sassOptions: {
                                includePaths: [path.resolve("node_modules")],
                            }
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

        }
    ),
        new BundleTracker({filename: './webpack-stats.json'}),
        new VueLoaderPlugin(),
    ]
};