const axios = require('axios');
const request = require('request');
const fs = require('fs');
const User = require('./user');

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

            return Promise.all([writeFilePromise, saveSidPromise])
                .then(() => {
                    console.log(`图片写入成功,sid保存成功,学号${userName}, sid: ${sid}`);
                    return sid;
                })


        })
        .catch(err => {
            console.log(err);
        })
}

