const axios = require('axios');
const request = require('request');
const fs = require('fs');
const User = require('./user.js');
// const Connection = require('handleConnection');

let imgUrl = 'http://jwc.swjtu.edu.cn/vatuu/GetRandomNumberToJPEG';
let sid = '';
//参数:学号
exports.getImgAndSession = function (userName) {
    return new Promise(function (_resolve, _reject) {
        request({
            url: imgUrl,
            encoding: 'binary'
        }, (err, res, body) => {
            //获取session id 
            sid = res.caseless.dict['set-cookie'][0].split(';')[0];
            _resolve([body, sid]);//body是图片
        });
    })
        .then(([body, sid]) => {
            let writeFilePromise = new Promise((resolve, reject) => {
                fs.writeFile(`./public/data/randImg/${userName}.jpg`, body, 'binary', (err) => {
                    if (err) {
                        reject('验证码图片写入失败');
                        console.log(err);
                    }
                    resolve();
                });//写入照片到文件
            })

            //将sid存到数据库
            let saveSidPromise = User.saveSid(userName, sid);

            Promise.all([writeFilePromise, saveSidPromise])
                .then(() => {
                    console.log(`图片写入成功,sid保存成功,学号${userName}, sid: ${sid}`);
                })
                .catch((err, msg) => {
                    console.log(err);
                })
            return sid;
        })
}


            // return axios.get(imgUrl, {
            //     headers: {
            //         'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            //         'Accept-Encoding': 'binary',
            //         'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            //         'Cache-Control': 'max-age=0',
            //         'Connection': 'keep-alive',
            //         'Cookie': `JSESSIONID=${SID}`,
            //         'Host': 'jwc.swjtu.edu.cn',
            //         'Upgrade-Insecure-Requests': '1',
            //         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
            //     }
            // })
