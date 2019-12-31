/**
 * 功能：获取验证码后，进行登录
 */
const user = require('./user');
const imgToString = require('./imgToString');
const getImg = require('./getImg');
const keepChecking = require('./keepChecking');
const util = require('./util');

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

let loginUser = {};//正在尝试登陆的用户，防止一个用户重复尝试
/**
 * 登录到教务网
 */
exports.login2 = async function (userName, password) {
    if (loginUser[userName])
        return;
    else
        loginUser[userName] = true;

    while (true) {
        let sid = await getImg.getImgAndSession(userName);
        let ranString = await imgToString.getWords(userName);
        if (ranString === 'NULL' || ranString.length !== 4) {
            await util.sleep(Math.random() * 1000);
            continue;
        }
        let loginRes = await user.fakeLogin(userName, password, sid, ranString);
        if (loginRes.data.loginStatus == 1) {
            //登录成功
            keepChecking.reRunAUser(userName);
            delete loginUser[userName];
            return loginRes.data;
            // resolve(result.data);
        } else if (loginRes.data.loginMsg.indexOf('验证码') >= 0) {
            // 验证码错误,再试
            await util.sleep(Math.random() * 2000 + 100);
        } else {
            // 可能是密码错误
            // reject(result.data);
            console.log(`${userName}:密码错误`);
            delete loginUser[userName];
            return loginRes.data;
        }
    }

}