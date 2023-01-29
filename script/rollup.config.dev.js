// 开发环境
import ts from "rollup-plugin-typescript2";
import babel from "rollup-plugin-babel";
import commonjs from 'rollup-plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import autoprefixer from 'autoprefixer'
import { defineConfig } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const html = require('@rollup/plugin-html');

const extensions = [".ts","less"];

export default defineConfig({
    input: "./src/page/player.ts", //入口
    output: [
        {
          name: 'Player',
          format: 'umd',
          sourcemap: true,
          file: "./dist/player.umd.js",
        }
    ],
    plugins:[
        ts(),
        nodeResolve({
            extensions,
        }),
        babel(),
        commonjs(),
        postcss({
            plugins:[
            autoprefixer()
            ],
            extract: 'css/index.css',
        }),
        // 热更新 默认监听根文件夹
        livereload(),
         // 本地服务器
        serve({
            open: true, // 自动打开页面
            port: 5000, 
            host: 'localhost',
            openPage:"/dist/index.html",
        })
    ]
})

