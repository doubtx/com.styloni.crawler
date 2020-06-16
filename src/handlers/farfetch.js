const Apify = require('apify');
const { utils: { log } } = Apify;

exports.handleStart = async ({ request, $ }, requestQueue) => {
    let lookupRegex = /initialState\_portal\-slices\-listing\_\_'\] = (?<initialState>.*?)<\/script>/s
    let initState = JSON.parse($.html().match(lookupRegex).groups.initialState)

    let maxPage = initState.listing.totalPages
    for (let page = 1; page <= maxPage; page++) {
        await requestQueue.addRequest({
            url: `https://www.farfetch.com/shopping/women/bags-purses-1/items.aspx?page=2${page}&view=180`,
            userData: Object.assign(request.userData, { handlerType: 'handleProducts'})
        })
    }
};

exports.handleProducts = async ({ request, $, body }, requestQueue) => {
    let lookupRegex = /initialState\_portal\-slices\-listing\_\_'\] = (?<initialState>.*?)<\/script>/s
    let initState = JSON.parse($.html().match(lookupRegex).groups.initialState)

    let links = initState.listing.products.map(p => p.url)
    for (let i = 0; i < links.length; i++) {
        await requestQueue.addRequest({
            url: "https://www.farfetch.com" + links[i],
            userData: Object.assign(request.userData, { handlerType: 'handleParse' })
        })
    }
};

exports.handleParse = async ({ request, $, body }, requestQueue) => {
    let lookupRegex = /initialState\_slice\-pdp\_\_'\] = (?<initialState>.*?)<\/script>/s
    let initState = JSON.parse($.html().match(lookupRegex).groups.initialState)

    let productDetails = {
        url: request.url,
        crawl_page_id: request.id,
        crawl_time: Date.now(),
        store: request.userData.storeName,
        brand: initState.productViewModel.designerDetails.name,
        title: initState.productViewModel.details.shortDescription,
        description: initState.productViewModel.details.description,
        color: initState.productViewModel.details.colors,
        category1: initState.productViewModel.categories.subCategory.name,
        category2: null,
        images: initState.productViewModel.images.main.map(i => i.zoom),
        price: parseFloat(initState.productViewModel.priceInfo.default.finalPrice),
        original_price: parseFloat(initState.productViewModel.priceInfo.default.initialPrice)
    }

    await Apify.pushData(productDetails)
};