const { defineConfig } = require('rollup');
const { getBasePlugin } = require('../../../script/rollup-helper.cjs')

module.exports =  defineConfig({
    input: './src/index.ts',
    output: [
        {
            file: './dist/player.esm.js',
            format: 'esm',
        },
        {
            file: './dist/player.umd.js',
            format: 'umd',
            name: 'NiPlayer',
        },
    ],
    plugins: [
        ...getBasePlugin(process.env.NODE_ENV),
    ],
})
