/**
 * 调用百度文字识别API
 */
const axios = require('axios');
const querystring = require('querystring');
const config = require('./sensitiveConfig');

exports.getWords = function (userName) {
    return axios.post(`https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token= ${config.baiduApi.access_token}`,
        querystring.stringify({
            url: `http://vin94.cn/public/data/randImg/${userName}.jpg?test=${new Date().getTime()}`,
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then((result) => {
            console.log(result.data);
            // if (result.data.words_result[0]) {
            return result.data.words_result[0].words;
            // } else {
            // return 'NULL';
            // }
        });
}
