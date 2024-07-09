const path = require('node:path')
exports.getBasePlugin = (ENV) => {
    const ts = require('@rollup/plugin-typescript');
    const commonjs = require('@rollup/plugin-commonjs');
    const postcss = require('rollup-plugin-postcss');
    const px2rem = require('postcss-pxtorem');
    const autoprefixer = require('autoprefixer');
    const babel = require('@rollup/plugin-babel');
    const terser = require('@rollup/plugin-terser');
    const json = require('@rollup/plugin-json');
    const alias = require('@rollup/plugin-alias');
    const less = require('rollup-plugin-less');
    const { nodeResolve } = require('@rollup/plugin-node-resolve');

    // 用于在导入socket.io-client包时进行Polyfill，因为该库中引入了很多只在node环境下才具有的第三方包例如http,stream,buffer等
    // 因此需要导入 'rollup-plugin-node-builtins' 和 "rollup-plugin-node-globals"进行Polyfill
    const builtins = require('rollup-plugin-node-builtins');
    const globals = require('rollup-plugin-node-globals');

    const basePlugin = [
        ts(),
        nodeResolve({
            browser: true,
        }),
        commonjs(),
        babel(),
        less({
            insert: true
        }),
        // postcss({
        //     plugins: [
        //         autoprefixer(),
        //         px2rem({
        //             rootValue: 16,
        //             propList: [
        //                 'margin-left',
        //                 'min-width',
        //                 'height',
        //                 'font-size',
        //                 'bottom',
        //                 'width',
        //                 'padding',
        //                 'transform',
        //             ],
        //             selectorBlackList: [
        //                 'video-progress-thumbnails',
        //                 /.+-thumbnails$/,
        //             ],
        //         }),
        //     ],
        //     extensions: ['.less', '.css']
        // }),
        builtins(),
        globals(),
        terser(),
        json(),
        alias({
            entries: [
                {
                    find: '@',
                    replacement: path.resolve(__dirname, '../', 'packages/niplayer/src'),
                },
            ],
        }),
    ];
    const devPlugin = [];
    const prodPlugin = [];
    const plugin = ENV === 'dev' ? 
        [...basePlugin, ...devPlugin] : 
        ENV === 'prod' ? [...basePlugin, ...prodPlugin] : basePlugin;

    return plugin;
}