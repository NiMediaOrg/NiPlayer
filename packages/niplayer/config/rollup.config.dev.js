// 开发环境
import postcss from 'rollup-plugin-postcss'
import autoprefixer from 'autoprefixer'
import { defineConfig } from 'rollup'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import { getBasePlugin } from '../../../script/rollup-helper.cjs'

export default defineConfig({
    input: './src/page/player.ts', //入口
    output: [
        {
            name: 'Player',
            format: 'umd',
            sourcemap: true,
            file: './dist/player.umd.js',
        },
    ],
    plugins: [
        ...getBasePlugin(process.env.NODE_ENV),
        postcss({
            plugins: [autoprefixer()],
            extract: 'css/index.css',
        }),
        // 热更新 默认监听根文件夹
        livereload(),
        // 本地服务器
        serve({
            open: true, // 自动打开页面
            port: 5000,
            host: 'localhost',
            openPage: '/dist/index.html',
        }),
    ],
})
