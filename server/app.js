const Koa = require('koa')
const { Nuxt, Builder } = require('nuxt')
const debugModule = require('debug') 
const consts = require('./utils/consts')
const config = require('../nuxt.config.js')
const bunyan = require('bunyan')
const mkdirp = require('mkdirp')
const koaBunyan = require('koa-bunyan')
const koaLogger = require('koa-bunyan-logger')


async function start() {
    const isWin = /^win/.test(process.platform)
    //console.log(process.platform);
    const app = new Koa()
    const host = consts.HOST
    const port = consts.PORT
    const debug = debugModule('app')

    app.keys = ['hare-server']
    config.dev = !(app.env === 'production')
    // logging
    let logDir = process.env.LOG_DIR || (isWin ? 'C:\\\\log' : '/var/tmp/log')
    console.log(logDir);
    let repliceSrc = logDir.replace(/(\\|\/)+$/, '') + (isWin ? '\\\\' : '/');
    
    mkdirp.sync(repliceSrc);
    
    const access = {
        logDirtype: 'rotating-file',
        path: `${logDir}hare-access.log`,
        level: config.dev ? 'debug' : 'info',
        period: '1d',
        count: 4
    }
    const error = {
        type: 'rotating-file',
        path: `${logDir}hare-error.log`,
        level: 'error',
        period: '1d',
        count: 4
    }
    const logger = bunyan.createLogger({
        name: 'hare',
        streams: [access, error]
    })
    /* app.use(koaBunyan(logger, { level: 'info' }))
    app.use(koaLogger(logger)) */







    app.listen(3000)
}


start();