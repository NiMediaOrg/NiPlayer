const { defineConfig } = require('@rspack/cli');
const baseOptions = require('../../../rspack.base.config.cjs');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require('node:path');

module.exports = defineConfig({
    mode: 'development',
    entry: {
        core: './demo/index.ts',
    },
    module: {
        rules: [
            ...baseOptions.module?.rules || []
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "../demo/index.html"),
        })
    ],
    resolve: {
        alias: {
            ...(baseOptions.resolve?.alias || {}),
            '@': path.resolve(__dirname, "../src")
        },
        extensions: [
            ...baseOptions.resolve?.extensions || []
        ]
    },
    devServer: {
        port: 7777,
        open: true,
        hot: true
    }
})