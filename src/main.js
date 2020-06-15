
const Apify = require('apify');
const { utils: { log } } = Apify;
const { getHandler } = require('./handlers')

const proxyMiddleware = process.env.PROXY_MIDDLEWARE
const proxyAccessToken = process.env.PROXY_ACCESS_TOKEN

Apify.main(async () => {
    const { startUrls } = await Apify.getInput();
    const requestList = await Apify.openRequestList('start-urls', startUrls);
    const requestQueue = await Apify.openRequestQueue();

    let proxyConfiguration = await Apify.createProxyConfiguration({
        newUrlFunction: function(sessionId) {
            return `socks5://${sessionId}:${proxyAccessToken}@${proxyMiddleware}`
        }
    });

    const crawler = new Apify.CheerioCrawler({
        requestList,
        requestQueue,
        proxyConfiguration,
        useSessionPool: true,
        sessionPoolOptions: {
            maxPoolSize: 20
        },
        persistCookiesPerSession: true,
        maxConcurrency: 20,
        minConcurrency: 20,
        requestTimeoutSecs: 120,
        additionalMimeTypes: [ 'application/json' ],
        handlePageFunction: async (context) => {
            const { url, userData: { storeName, handlerType } } = context.request;
            log.info('Page opened.', { storeName, handlerType, url });
            let handler = getHandler(storeName, handlerType)
            return handler(context, requestQueue);
        },
    });

    log.info('Starting the crawl.');
    await crawler.run();
    log.info('Crawl finished.');
});
