const Server = require('./helpers/server')
const Application = require('./app')
const webSS = require('./services/webss')
const logger = require('./helpers/logger')

/**
 * Load config
 */
require('dotenv').config()

/**
 * Application Entrypoint
 * @returns {{stop: (function(): Promise<void>), start: (function(): Promise<void>)}}
 */
module.exports = () => {
    let server
    let isAppClosing = false
    const config = {
        host: process.env.SERVER_HOST,
        port: process.env.SERVER_PORT,
        waitForConnectionClose: process.env.SERVER_WAIT_FOR_CONNECTION_CLOSE,
    }
    /**
     * Application starter
     * @returns {Promise<void>}
     */
    const start = async () => {
        logger.info('starting application')
        logger.info('starting browser')
        await webSS.launchBrowser()

        logger.info('starting http-server')
        const application = Application()
        const tmpServer = new Server({ config, requestHandler: application })
        await tmpServer.start()
        server = tmpServer
    }

    /**
     * Will be called when user presses ctrl +c
     * Close all the opened resources
     * @returns {Promise<void>}
     */
    const stop = async () => {
        logger.info('stoping application')
        if (isAppClosing) return
        isAppClosing = true
        /**
         * Stop server
         */
        logger.info('stopping server')
        if (server) await server.stop()
        /**
         * Close browser
         */
        logger.info('closing browser')
        await webSS.closeBrowser()
    }

    /**
     * Capture ctrl + c single from user
     */
    process.on('SIGTERM', stop)
    process.on('SIGINT', stop)

    return { start, stop }
}
