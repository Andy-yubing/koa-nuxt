const Koa = require('koa')
const { Nuxt, Builder } = require('nuxt')
const debugModule = require('debug') 
const koaConnect = require('koa-connect')
const consts = require('./utils/consts')
const config = require('../nuxt.config.js')
const bunyan = require('bunyan')
const mkdirp = require('mkdirp')
const koaBunyan = require('koa-bunyan')
const koaLogger = require('koa-bunyan-logger')
const session = require("koa-session")
const compose = require('koa-compose')
const compress = require('koa-compress')
const koaBody = require("koa-body");
const debugModule = require('debug')
const api = require('./api')

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
    let logDir = process.env.LOG_DIR || (isWin ? '\log' : '/var/tmp/log')
   
    let repliceSrc = logDir.replace(/(\\|\/)+$/, '') + (isWin ? '\\' : '/');
    //console.log(repliceSrc);
   
    mkdirp.sync(repliceSrc, function (err) {
        if (err) console.error("asdaaaaaaaaa")
        else console.log('pow!')
    });
    
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
    //console.log(access);
    const logger = bunyan.createLogger({
        name: 'hare',
        streams: [access, error]
    })
    app.use(koaBunyan(logger, { level: 'info' }))
    app.use(koaLogger(logger))

    app.use(async function subApp(ctx, next) {
        //console.log("_____"+ctx.url.split('/')[1]);
        
        ctx.state.subapp = ctx.url.split('/')[1];
        await next();
    })

    const nuxt = new Nuxt(config)

    if(config.dev){
        const devConfigs = config.development;
        if (devConfigs && devConfigs.proxies){
            for (let proxyItem of devConfigs.proxies) {
                console.log(
                    `Active Proxy: path[${proxyItem.path}] target[${proxyItem.target}]`
                )
                app.use(proxy(proxyItem.path, proxyItem))
            }
        }
        await new Builder(nuxt).build();
    }
    
   // console.log(nuxt.render);
    
    const nuxtRender = koaConnect(nuxt.render)
    //console.log(nuxtRender);
    app.use(async (ctx,next)=>{
        await next()
        //console.log("+_+_" + ctx.state.subapp);
        if (ctx.state.subapp !== consts.API){
            ctx.status = 200;
            //console.log(ctx.session);
            ctx.req.session = ctx.session;
            await nuxtRender(ctx)
        }
    })

    const SESSION_CONFIG = {
        key: consts.SESS_KEY
    }

    app.use(session(SESSION_CONFIG,app))

    app.use(async function responseTime(ctx,next) {
        const t1 = Date.now();
        await next()
        const t2 = Date.now()
        //console.log(Math.ceil(t2 - t1));
        
        ctx.response.set('X-Response-Time', Math.ceil(t2 - t1) + 'ms')
    })

    //数据压缩
    app.use(compress({}))

    // only search-index www subdomain
    app.use(async function robots(ctx, next) {
        await next()
        if (ctx.hostname.slice(0, 3) !== 'www') {
            ctx.response.set('X-Robots-Tag', 'noindex, nofollow')
        }
    })

    app.use(koaBody())


    app.use(async function (ctx, next) {
        debug(ctx.method + ' ' + ctx.url)
        await next()
    })











    app.listen(3000)
}


start();