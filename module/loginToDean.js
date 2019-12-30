/**
 * 功能：获取验证码后，进行登录
 */
const user = require('./user');
const imgToString = require('./imgToString');
const getImg = require('./getImg');
const keepChecking = require('./keepChecking');

let _sid = 'JSESSIONID=';

exports.login = function (userName, password) {
    getImg.getImgAndSession(userName)
        .then((sid) => {
            _sid = sid;
            return imgToString.getWords(userName);
        })
        .then((ranString) => {
            return user.fakeLogin(userName, password, _sid, ranString);
        })
        .then((result) => {
            return new Promise((resolve, reject) => {
                if (result.data.loginStatus == 1) {
                    //登录成功
                    //keepChecking.reRun();
                    keepChecking.reRunAUser(userName);
                    resolve(result.data);
                } else if (result.data.loginMsg.indexOf('验证码') >= 0) {
                    // 验证码错误,再试
                    // setTimeout(() => {
                    exports.login(userName, password);
                    // }, Math.random() * 1000 + 2000);
                } else {
                    // 可能是密码错误
                    reject(result.data);
                    console.log(`${userName}:密码错误`);
                }
            })
        })
}