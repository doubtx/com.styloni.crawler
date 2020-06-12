


exports.getHandler = function (storeName, handlerType) {
    let { handleStart,  handleProducts } = require('./' + storeName)
    if (handlerType === 'handleStart') {
        return handleStart
    } else if (handlerType === 'handleProducts') {
        return handleProducts
    }
}