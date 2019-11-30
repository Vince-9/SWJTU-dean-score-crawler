const express = require('express');
const fs = require('fs');
const router = express.Router();
const body = require('body-parser');
const User = require('./user.js');
const getImg = require('./getImg.js');
const getLatestGrade = require('./getLatestGrade.js');
const email = require('./email.js');
const keepChecking = require('./keepChecking.js');


router.get('/grades', (req, res) => {
    res.render('index.html');
});

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
            return User.fakeLogin(userName, userInfo.password, req.body.sid, req.body.randString);

        })
        .then((results) => {

            // console.log("第二个post请求:",results.data);
            res.send(results.data);
            if (results.data.loginStatus == 1) {
                console.log(req.body.sid);
                return getLatestGrade.getGradeBySid(req.body.sid);
            }

        })
        .then((grades) => {
            //重新运行
            keepChecking.stopChecking();
            keepChecking.startChecking();
            
            //发送登录成功邮件
            if (grades) {
                email.sendMailSuccessLogin(userInfo.email, grades);
            } else {
                email.sendMailSuccessLoginWithoutComment(userInfo.email);
            }
            // //保存最新课程名到数据库
            return User.saveClassNameByUserName(userName, grades.className);
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