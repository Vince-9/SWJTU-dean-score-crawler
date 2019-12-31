const express = require('express');
const fs = require('fs');
const router = express.Router();
const body = require('body-parser');
const User = require('../module/user');
const getImg = require('../module/getImg');
const getLatestGrade = require('../module/getLatestGrade');
const email = require('../module/email');
const keepChecking = require('../module/keepChecking');
const imgToString = require('../module/imgToString');

keepChecking.startChecking(); //开始查成绩

router.get('/grades', (req, res) => {
    res.render('index.html');
});

// 毛概
router.get('/quest', (req, res) => {
    // fs.readFile('../views/quest.html', (err, data) => {
    //     if (err) console.log(err);
    //     res.send(data);
    //     console.log(data);
    // })
    let quest = fs.readFileSync('./views/quest.html');
    res.end(quest);
})

router.post('/GradeNotice', (req, res) => {
    console.log(req.body);
    let userName = req.body.username,
        password = req.body.password,
        email = req.body.email,
        CDKEY = req.body.CDKEY;
    console.log(userName);
    CDKEY = CDKEY.toLowerCase();
    User.addUser(userName, password, email)
        .then((results) => {
            res.setHeader('Set-Cookie', `username=${userName}`);
            res.send({
                code: 1,
                msg: '录入成功，接下来请输入验证码'
            })
        }).catch((err, msg) => {
            console.log('233', err, msg);
            res.send({
                code: -1,
                msg: `${err}，请返回重试`
            });
        })
});

//获取验证码和sid
router.post('/getRand', (req, res) => {
    console.log(req.body);
    let userName = req.body.username;
    getImg.getImgAndSession(userName)
        .then((sid) => {
            res.send({ code: 1, sid: sid.trim(), msg: '获取验证码和sid成功' });
        })
        .catch(() => {
            res.send({ code: -1, msg: '获取验证码和sid失败' });
        });
})

//提交验证码
router.post('/postRand', (req, res) => {
    console.log(req.body);
    let userName = req.body.username; //学号
    let userInfo = {};
    User.getUserInfoFromMySqlBySid(req.body.sid) //从数据库获取密码
        .then((results) => {
            userInfo = results;
            if (!userInfo) {
                res.send({ loginStatus: -1, loginMsg: '用户未录入！请刷新页面录入后再试' });
                throw '用户未录入';
            }
            return User.fakeLogin(userName, userInfo.password, req.body.sid, req.body.randString);

        })
        .then((results) => {

            res.send(results.data);
            if (results.data.loginStatus == 1) {
                console.log(req.body.sid);
                return getLatestGrade.getGradeBySid(req.body.sid);
            } else {
                throw '登录失败';
            }

        })
        .then((grades) => {
            //发送登录成功邮件
            if (grades) {
                email.sendMailSuccessLogin(userInfo.email, grades);
            } else {
                email.sendMailSuccessLoginWithoutComment(userInfo.email);
            }
            //保存最新课程名到数据库
            return User.saveClassNameByUserName(userName, grades.className);
        })
        .then((res) => {
            //重新运行
            // keepChecking.stopChecking();
            // keepChecking.startChecking();
            keepChecking.reRunAUser(userName);
        })
        .catch((err) => {
            console.log(err);
        })
})

router.post('/test', (req, res) => {
    console.log(req);
    res.end('hahahahah');
})

module.exports = router;