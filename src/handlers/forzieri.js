const Apify = require('apify');

const { utils: { log } } = Apify;
const { URL } = require('url');

exports.handleStart = async ({ request, $ }, requestQueue) => {
    let perPage = 96
    let totalItemsBlock = $('.product-list-meta .boldLabel > .boldLabel').html()
    let totalItems = totalItemsBlock.match(/(?<totalItems>\d+) items/).groups.totalItems

    let maxPage = Math.ceil(totalItems/perPage)
    for (let page = 1; page <= maxPage; page++) {
        await requestQueue.addRequest({
            url: `https://www.forzieri.com/handbags/${page}-more`,
            userData: { handlerType: 'handleProducts', storeName: 'forzieri' }
        })
    }
};

exports.handleProducts = async ({ request, $, body }, requestQueue) => {
    let links = $('.product-list-item .thumbs').map((i, el) => $(el).attr('href'))
    for (let i = 0; i < links.length; i++) {
        await requestQueue.addRequest({
            url: links[i],
            userData: { handlerType: 'handleParse', storeName: 'forzieri' }
        })
    }
};

exports.handleParse = async ({ request, $, body }, requestQueue) => {
    let productDetails = {
        url: request.url,
        store: request.userData.storeName,
        brand: $('.brand-name a').text(),
        title: $('.product-name').text(),
        description: $('.product-description-wrap p:nth-of-type(1)').text(),
        color: $('#product_variant_name span').text(),
        category1: null,
        category2: null,
        images: [],
        original_price: parseFloat($('#listPrice').text().replace('$', ''))
    }

    let imagesElements = $('.product-image-wrap img')
    for (let i = 0; i < imagesElements.length; i++) {
        productDetails.images.push(imagesElements[i].attribs['data-zoom-url'])
    }

    if ($('#salePrice').text() === '') {
        productDetails.price = productDetails.original_price
    } else {
        productDetails.price = parseFloat($('#salePrice').text().replace('$', ''))
    }

    await Apify.pushData(productDetails)
};