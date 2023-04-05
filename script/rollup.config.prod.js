import ts from "rollup-plugin-typescript2";
import postcss from 'rollup-plugin-postcss'
import autoprefixer from 'autoprefixer'
import { defineConfig } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import alias from '@rollup/plugin-alias';
// 用于在导入socket.io-client包时进行Polyfill，因为该库中引入了很多只在node环境下才具有的第三方包例如http,stream,buffer等
// 因此需要导入 'rollup-plugin-node-builtins' 和 "rollup-plugin-node-globals"进行Polyfill
import builtins from 'rollup-plugin-node-builtins'
import globals from "rollup-plugin-node-globals";
import replace from '@rollup/plugin-replace';
const path = require("path")

export default defineConfig({
    input:"./src/index.ts",
    output: [
      {
        file: "./dist/player.cjs.js",
        format: "cjs",
      },
      {
        file: "./dist/player.min.cjs.js",
        format: "cjs",
        plugins:[terser()]
      },
      {
        file: "./dist/player.esm.js",
        format: "esm",
      },
      {
        file: "./dist/player.min.esm.js",
        format: "esm",
        plugins:[terser()]
      },
      {
        file: "./dist/player.umd.js",
        format: "umd",
        name: "Player",
      },
      {
        file: "./dist/player.min.umd.js",
        format: "umd",
        name: "Player",
        plugins:[terser()]
      },
    ],
    plugins:[
         //ts插件让rollup读取ts文件
      ts(),
      nodeResolve({
        browser: true
      }),
      builtins(),
      globals(),
      replace({
        "process.env.NODE_ENV": JSON.stringify("development"),
        preventAssignment: true
      }),
      json(),
      babel(),
      commonjs(),
      postcss({
        plugins:[
          autoprefixer()
        ]
      }),
      alias({
        entries: [
          {
            find: '@',
            replacement: path.resolve(__dirname, '../','src')
          }
        ],
      }),
    ]
})