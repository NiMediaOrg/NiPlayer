const { defineConfig } = require('@rspack/cli');
const baseOptions = require('../../rspack.base.config.cjs');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require('node:path');

module.exports = defineConfig({
    mode: 'development',
    entry: {
        core: './example/index.ts',
    },
    module: {
        rules: [
            ...baseOptions.module?.rules || []
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "./example/index.html"),
        })
    ],
    devServer: {
        port: 8888,
        open: true,
        hot: true,
        static: {
            directory: path.resolve(__dirname, "./example/assets"),
        },
    },
    resolve: {
        extensions: [
            ...baseOptions.resolve?.extensions || []
        ]
    },
})