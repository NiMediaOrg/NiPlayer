import ts from "rollup-plugin-typescript2";
import babel from "rollup-plugin-babel";
import commonjs from 'rollup-plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import autoprefixer from 'autoprefixer'
import { defineConfig } from "rollup";
import {nodeResolve} from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

const extensions = [".ts","less"];

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
        extensions,
      }),
      babel(),
      commonjs(),
      postcss({
        plugins:[
          autoprefixer()
        ]
      }),
    ]
})