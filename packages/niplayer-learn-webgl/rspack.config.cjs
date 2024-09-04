const { defineConfig } = require('@rspack/cli');
const baseOptions = require('../../rspack.base.config.cjs');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require('node:path');

module.exports = defineConfig({
    mode: 'development',
    entry: {
        core: './src/index-3d.ts',
    },
    module: {
        rules: [
            ...baseOptions.module?.rules || [],
            {
                test: /\.glsl$/i,
                type: 'asset/source',
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "./index-3d.html"),
        })
    ],
    devServer: {
        port: 1010,
        open: true,
        hot: true,
        static: {
            directory: path.resolve(__dirname, "./assets"),
        },
    },
    resolve: {
        extensions: [
            ...baseOptions.resolve?.extensions || []
        ]
    },
})