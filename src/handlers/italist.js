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
    await Apify.pushData(jsonData.props.initialState.api.products.map(p => ({
        url: 'https://www.italist.com/us/' + p.url,
        store: request.userData.storeName,
        brand: p.brand,
        title: p.model,
        description: p.description,
        images: p.images,
        price: parseFloat(p.rrp),
        original_price: parseFloat(p.rrp_not_reduced)
    })))
};
