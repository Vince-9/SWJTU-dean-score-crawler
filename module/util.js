
/**
 * 异步：等待time毫秒
 * @param{Number} time
 */
exports.sleep = function (time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    })
}