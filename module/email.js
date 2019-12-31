const nodemailer = require('nodemailer');
const logger = require('./logger');
let transporter = require('./sensitiveConfig').transporter;

// 发送登录成功的邮件通知
exports.sendMailSuccessLogin = function (email, grades) {
    logger.log('登录成功通知，发送邮件：', email, ' 成绩：', grades.finalGrade);
    let mailOptions = {
        from: '"[麦芽糖]成绩通知系统" <1779844498@qq.com>', // sender address
        to: email, // list of receivers
        subject: '【登录成功】你已成功登录成绩通知系统', // Subject line
        html: `<h1>欢迎来到麦芽糖的邮件通知系统</h1><h2>当有新成绩时，我会第一时间通知你哒</h2><p>最新成绩为：</p><p>${grades.className}</p><p>最终成绩：<b>${grades.finalGrade}</b></p><p>期末成绩：<b>${grades.paperGrade}</b></p><p>平时成绩：<b>${grades.regularGrade}</b></p>
        <p>如需退订/重新订阅服务或修改邮箱，请访问<a href="http://vin94.cn/grade-setting" target="_blank" rel="noopener noreferrer">vin94.cn/grade-setting</a></p>` // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('发送邮件: %s', info.messageId);
        // Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
    });

}

// 发送登录成功但未完成课程评价的邮件通知
exports.sendMailSuccessLoginWithoutComment = function (email) {
    logger.log('登录成功但未完成课程评价，发送邮件：', email);
    let mailOptions = {
        from: '"[麦芽糖]成绩通知系统" <1779844498@qq.com>', // sender address
        to: email, // list of receivers
        subject: '【登录成功】你已成功登录成绩通知系统', // Subject line
        html: `<h1>欢迎来到麦芽糖的邮件通知系统</h1><h2>当有新成绩时，我会第一时间通知你哒</h2><h2>你还没有完成课程评价，我无法查询你的成绩哦</h2>
        <p>如需退订/重新订阅服务或修改邮箱，请访问<a href="http://vin94.cn/grade-setting" target="_blank" rel="noopener noreferrer">vin94.cn/grade-setting</a></p>` // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('发送邮件: %s', info.messageId);
        // Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
    });

}

//新成绩时,发送邮件
exports.sendMailNewGrade = function (email, grades) {
    logger.log('新成绩通知，发送邮件：', email, ' 成绩：', grades.finalGrade);
    let mailOptions = {
        from: '"[麦芽糖]成绩通知系统" <1779844498@qq.com>', // sender address
        to: email, // list of receivers
        subject: `【新成绩通知】你有新的成绩：${grades.finalGrade}分`, // Subject line
        html: `<h1>欢迎来到麦芽糖的邮件通知系统</h1><h2>当有新成绩时，我会第一时间通知你哒</h2><p>最新成绩为：</p><p>${grades.className}</p><p>最终成绩：<b>${grades.finalGrade}</b></p><p>期末成绩：<b>${grades.paperGrade}</b></p><p>平时成绩：<b>${grades.regularGrade}</b></p>
        <p>如需退订/重新订阅服务或修改邮箱，请访问<a href="http://vin94.cn/grade-setting" target="_blank" rel="noopener noreferrer">vin94.cn/grade-setting</a></p>` // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('发送邮件: %s', info.messageId);
        // Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
    });

}