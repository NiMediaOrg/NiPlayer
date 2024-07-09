const { createServer } = require('vite');
const path = require("path");
const fs = require('fs');
async function dev(dir, port) {
    const rootPath = path.resolve(fs.realpathSync(process.cwd()), `./${dir}`)
    //* vite的开发环境配置
    /**
   * @type {import('vite').UserConfig}
   */
    const viteCfg = {
        mode: 'development',
        root: rootPath,
        logLevel: 'warn',
        publicDir: path.resolve(__dirname, `../../assets`),
        server: {
            host: '127.0.0.1',
            port: port,
            open: true,
            https: false,
            fs: {
                strict: false
            },
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '../../packages/niplayer/src'),
            },
        },
    }

    const server = await createServer(viteCfg)
    await server.listen()
    console.log('The Server is Running On: ')
    console.log(`http://127.0.0.1:${port}/${dir}`)
}

module.exports = dev;