const Apify = require('apify');

const { utils: { log } } = Apify;
const { URL } = require('url');

exports.handleStart = async ({ request, $ }, requestQueue) => {
    let url = new URL(request.url)
    let maxPageBlock = $('.f12wdj-0 .sc-11stafi-11 span').parent().text()
    let maxPage = maxPageBlock.match(/\.\.\.of(?<maxPage>\d+)/).groups.maxPage

    for (let i = 0; i< maxPage; i++) {
        url.searchParams.set('skip', (i * 60).toString())
        await requestQueue.addRequest({
            url: url.href,
            userData: { handlerType: 'handleProducts', storeName: 'italist' }
        })
    }
};

exports.handleProducts = async ({ request, $, body }, requestQueue) => {
    let jsonData = JSON.parse($('#__NEXT_DATA__').html())

    for (let i = 0; i < jsonData.props.initialState.api.products.length; i++) {
        await requestQueue.addRequest({
            url: 'https://www.italist.com/us/' + jsonData.props.initialState.api.products[i].url,
            userData: { handlerType: 'handleParse', storeName: 'italist' }
        })
    }
};

exports.handleParse = async ({ request, $, body }, requestQueue) => {
    let jsonData = JSON.parse($('#__NEXT_DATA__').html())
    await Apify.pushData({
        url: 'https://www.italist.com/us' + request.url,
        store: request.userData.storeName,
        brand: jsonData.props.initialState.api.product.brand,
        title: jsonData.props.initialState.api.product.model,
        description: jsonData.props.initialState.api.product.description,
        color: jsonData.props.initialState.api.product.color,
        category1: jsonData.props.initialState.api.product.category,
        category2: null,
        images: jsonData.props.initialState.api.product.images.map(i => i.zoom),
        price: parseFloat(jsonData.props.initialState.api.product.rrp),
        original_price: parseFloat(jsonData.api.product.rrp_not_reduced)
    })
};