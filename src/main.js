
const Apify = require('apify');
const axios = require('axios');
const { utils: { log } } = Apify;

const { getHandler } = require('./handlers')

Apify.main(async () => {
    const { startUrls, proxyEndpoint } = await Apify.getInput();
    const requestList = await Apify.openRequestList('start-urls', startUrls);
    const requestQueue = await Apify.openRequestQueue();

    // let proxyEndpointRes = await axios.get(proxyEndpoint)
    // let proxyConfiguration = await Apify.createProxyConfiguration({
    //     proxyUrls: proxyEndpointRes.data.map(p => {
    //         return 'http://' + p.proxy_host
    //     })
    // });

    let proxyConfiguration = await Apify.createProxyConfiguration({
        groups: ['BUYPROXIES94952']
    });

    const crawler = new Apify.CheerioCrawler({
        requestList,
        requestQueue,
        proxyConfiguration,
        useSessionPool: true,
        persistCookiesPerSession: true,
        maxConcurrency: 50,
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
