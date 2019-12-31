const connection = require('./handleConnection').connection;
const axios = require('axios');
const querystring = require('querystring');
const logger = require('./logger')

//添加新用户
exports.addUser = function (userName, password, email) {
    return new Promise((_resolve, _reject) => {
        //查重
        exports.findUserByName(userName)
            .then((testDup) => {
                if (testDup.length > 0) {
                    _reject('用户已存在');
                    return;
                }
                //将用户信息插入表中
                let sqlLine = `INSERT INTO user_info (user_name,password, email, status) VALUES( ? , ?, ?, 1)`;
                connection.query(sqlLine, [userName, password, email], function (error, results, fields) {
                    if (error) _reject(error, '信息注册失败');
                    _resolve(results);
                    // console.log(results);
                    // console.log('\n', fields);
                });
            })
    })

}

exports.findUserByName = function (userName) {
    let sqlLine = 'SELECT * FROM user_info WHERE user_name = ?';
    return new Promise((resolve, reject) => {
        connection.query(sqlLine, [userName], function (error, results, fields) {
            if (error) reject(error, '查询失败');
            resolve(results); //[ RowDataPacket { user_name: '123', password: '1234' } ]
        });
    });
}

exports.getPasswordByName = function (userName) {
    let sqlLine = 'SELECT password FROM user_info WHERE user_name = ?';
    return new Promise((resolve, reject) => {
        connection.query(sqlLine, [userName], function (error, results, fields) {
            if (error) reject([error, '查询失败']);
            resolve(results[0].password); //[ RowDataPacket { user_name: '123', password: '1234' } ]
        });
    });
}

//保存sid到数据库
exports.saveSid = function (userName, sid) {
    return new Promise((resolve, reject) => {
        console.log('saveSid ', userName, sid);
        let sqlLine = 'UPDATE user_info SET session_id = ? WHERE user_name = ?';
        connection.query(sqlLine, [sid, userName], (error, results) => {
            if (error) reject([error, '保存sid失败']);
            resolve(results);
            console.log(results);
        });
    });

}

exports.saveClassNameByUserName = function (userName, className) {
    return new Promise((resolve, reject) => {
        let sqlLine = 'UPDATE user_info SET latest_class_name = ? WHERE user_name = ?';
        connection.query(sqlLine, [className, userName], (err, results) => {
            if (err) reject(err);
            resolve(results);
        })
    })
}

//模拟登录,返回结果示例：
//.data:{ loginMsg: '验证码输入不正确', loginStatus: '-2' }
exports.fakeLogin = function (userName, password, sid, randString) {
    console.log(randString);
    let results = {};
    return axios.post('http://jwc.swjtu.edu.cn/vatuu/UserLoginAction', querystring.stringify({
        username: userName,
        password: password,
        url: 'http://jwc.swjtu.edu.cn/index.html',
        returnUrl: '',
        area: '',
        ranstring: randString
    }), {
        headers: {
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive',
            'Content-Length': '122',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Cookie': `username=${userName};${sid}`,
            'Host': 'jwc.swjtu.edu.cn',
            'Origin': 'http://jwc.swjtu.edu.cn',
            'Referer': 'http://jwc.swjtu.edu.cn/service/login.html?version=20192',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
        .then((_result) => {
            results = _result;
            console.log('fakeLogin: ', results.data);
            let loginMsg = results.data.loginMsg;
            if (loginMsg.indexOf('密码') >= 0 || loginMsg.indexOf('用户不存在') >= 0) {
                // 密码错误或用户不存在
                exports.deleteUserByUsername(userName);
                logger.log('删除了用户：', userName);
                return;
            }

            return axios.post('http://dean.vatuu.com/vatuu/UserLoadingAction', querystring.stringify({
                "url": "http://dean.vatuu.com/vatuu/UserLoadingAction",
                "returnUrl": "",
                "loginMsg": results.data["loginMsg"]
            }), {
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
                    'Accept-Encoding': 'gzip, deflate',
                    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                    'Cache-Control': 'max-age=0',
                    'Connection': 'keep-alive',
                    'Content-Length': '446',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cookie': `${sid}`,
                    'Host': 'jwc.swjtu.edu.cn',
                    'Origin': 'http://jwc.swjtu.edu.cn',
                    'Referer': 'http://jwc.swjtu.edu.cn/service/login.html?version=20192',
                    'Upgrade-Insecure-Requests': '1',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
                }
            })

        })
        .then((res) => {
            console.log('模拟登录');
            return results;
        })
        .catch(err => {
            console.log(err);
        })
}

// exports.fakeLogin('2017114305','TWC1779844498','B7D75B7699CDD01CF2941B01B18F88C6','PGTE');

exports.getAllDataFromMySql = function () {
    let sqlLine = `SELECT * FROM user_info`;

    return new Promise((resolve, reject) => {
        connection.query(sqlLine, (err, results) => {
            if (err) {
                reject(err);
            }
            resolve(results);
        })

    })
}

//获取所有status不为0的信息
exports.getAllNoShutdownDataFromMySql = function () {
    let sqlLine = `SELECT * FROM user_info WHERE status <> 0`;

    return new Promise((resolve, reject) => {
        connection.query(sqlLine, (err, results) => {
            if (err) {
                reject(err);
            }
            resolve(results);
        })

    })
}

exports.getUserInfoFromMySqlBySid = function (sid) {
    return new Promise((resolve, reject) => {
        let sqlLine = 'SELECT * FROM user_info WHERE session_id = ?'
        connection.query(sqlLine, [sid], (err, results) => {
            if (err) reject(err);
            resolve(results[0]);
        })
    })
}

exports.deleteUserByUsername = function (userName) {
    return new Promise((resolve, reject) => {
        let sqlLine = `DELETE FROM user_info WHERE user_name = ?`;
        connection.query(sqlLine, [userName], (err, results) => {
            if (err) reject(err);
            resolve(results);
        })
    })
        .catch(err => {
            console.log(err);
        })
}

/**
 * 在修改信息页登录
 */
exports.loginToHere = (req, res) => {
    return new Promise((resolve, reject) => {
        let sqlLine = `SELECT * FROM user_info WHERE user_name = ? AND password = ?`;
        connection.query(sqlLine, [req.body.userName, req.body.password], (err, qres) => {
            if (err) console.log(err);
            if (qres[0].user_name == req.body.userName) {
                req.session.isLogin = 1;
                req.session.userName = qres[0].user_name;
                req.session.password = qres[0].password;
                req.session.email = qres[0].email;
                qres[0].isLogin = 1;
                res.send(qres[0]);
            }
        })
    })
        .catch(err => {
            console.log(err);
            res.send({ err: '错误' });
        })
}

exports.setUserStatus = (userName, status) => {
    return new Promise((resolve, reject) => {
        let sqlLine = `UPDATE user_info SET status = ? WHERE user_name = ?`;
        connection.query(sqlLine, [status, userName], (err, qres) => {
            if (err) {
                console.log(err);
                reject({ status: 0 });
            }
            resolve({ status: 1 });
        })
    })
}

exports.setUserEmail = (userName, newEmail) => {
    return new Promise((resolve, reject) => {
        let sqlLine = `UPDATE user_info SET email = ? WHERE user_name = ?`;
        connection.query(sqlLine, [newEmail, userName], (err, qres) => {
            if (err) {
                console.log(err);
                reject({ status: 0 });
            }
            resolve({ status: 1 });
        })
    })
}

// exports.addUser();