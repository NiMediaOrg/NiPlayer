// @ts-check
const { defineConfig } = require('@rspack/cli');
const path = require('path');

const config = defineConfig({
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['solid', '@babel/preset-typescript'],
              plugins: ['solid-styled-jsx/babel']
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader'
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: 'postcss-loader'
          },
          {
            loader: 'less-loader',
          },
        ],
        type: 'css',
      },
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, "../src")
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx']
  }
});

module.exports = config;