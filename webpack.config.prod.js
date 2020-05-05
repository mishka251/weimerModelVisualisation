const path = require('path');
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const merge = require('webpack-merge');

const _merge = merge.smartStrategy(
    {
        entry: 'replace',
    }
);

class RelativeBundleTracker extends BundleTracker {
    convertPathChunks(chunks) {
        Object.entries(chunks).map(([k, chunk]) => {
                chunk.map(chunkItem => {
                    chunkItem.path = path.relative(this.options.relativePath, chunkItem.path);
                });
            }
        );
    }

    // noinspection JSUnusedGlobalSymbols
    writeOutput(compiler, contents) {
        if (contents.status === 'done' && this.options.relativePath) {
            this.convertPathChunks(contents.chunks);
        }
        super.writeOutput(compiler, contents);
    }
}

const config = require('./webpack.config.js');

module.exports = _merge(config, {
    mode: 'production',
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: true
            }),
            new OptimizeCSSAssetsPlugin({})
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: 'css/[name]-[hash].css',
            chunkFilename: 'css/[id]-[hash].css'
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
    ]
});
