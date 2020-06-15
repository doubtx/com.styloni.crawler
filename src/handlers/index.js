


exports.getHandler = function (storeName, handlerType) {
    let { handleStart,  handleProducts, handleParse } = require('./' + storeName)
    if (handlerType === 'handleStart') {
        return handleStart
    } else if (handlerType === 'handleParse') {
        return handleParse
    } else if (handlerType === 'handleProducts') {
        return handleProducts
    }
}