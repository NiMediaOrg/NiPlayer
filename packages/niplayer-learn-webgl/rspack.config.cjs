const { defineConfig } = require('@rspack/cli');
const baseOptions = require('../../rspack.base.config.cjs');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require('node:path');

module.exports = defineConfig({
    mode: 'development',
    entry: {
        core: './src/index.ts',
    },
    module: {
        rules: [
            ...baseOptions.module?.rules || []
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "./index.html"),
        })
    ],
    devServer: {
        port: 1010,
        open: true,
        hot: true,
    },
    resolve: {
        extensions: [
            ...baseOptions.resolve?.extensions || []
        ]
    },
})