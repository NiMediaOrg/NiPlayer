#!/usr/bin/env node
const sade = require('sade')
const dev = require('./dev.cjs')
const cli = sade('cli')
cli.command('dev [dir]', 'Start dev server')
    .option('-p, --port', 'Dev server port', 8081)
    .option('-o, --open', 'Open browser window on startup')
    .action((dir, { port, open }) => {
        dev(dir, port);
    })

cli.parse(process.argv)
