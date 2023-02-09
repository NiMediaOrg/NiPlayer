import ts from "rollup-plugin-typescript2";
import babel from "rollup-plugin-babel";
import commonjs from 'rollup-plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import autoprefixer from 'autoprefixer'
import { defineConfig } from "rollup";
import {nodeResolve} from "@rollup/plugin-node-resolve";

const extensions = [".ts","less"];
export default defineConfig({
    input: "./src/page/player.ts", //入口
    //插件
    plugins: [
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
      
    ],
  },
);
