/**
 * 不断地查询新成绩
 */
const user = require('./user.js');
const getLatestGrade = require('./getLatestGrade.js');
const email = require('./email.js');
const login = require('./loginToDean');
const logger = require('./logger');

let checkingInterval = [];


exports.runAUser = function (userInfo) {
    let temp = setInterval(() => {
        setTimeout(() => {

            // console.log(userInfo.latest_class_name);

            getLatestGrade.getGradeBySid(userInfo.session_id)
                .then((grades) => {
                    console.log(new Date(Date.now() + 8 * 60 * 60 * 1000), grades);
                    //若课程名为‘数据’ 说明查询失败 再查
                    if (grades && grades.className != userInfo.latest_class_name && grades.className != '数据') {
                        logger.log('新成绩！', userInfo.user_name, grades.className);
                        console.log(`\n\n新成绩！！\n\n`);
                        //保存新的课程名到数据库
                        return user.saveClassNameByUserName(userInfo.user_name, grades.className)
                            .then(() => {
                                // 发送邮件
                                email.sendMailNewGrade(userInfo.email, grades);
                                // 更新内存中的用户数据
                                exports.reRun();
                                //if (userInfo.latest_class_name != '数据') {
                                //email.sendMailNewGrade(userInfo.email, grades);
                                //}
                            })

                    }

                    // 若用户的最新课程名称为空
                    if (!userInfo.className) {
                        // 保存用户的最新课程名
                        user.saveClassNameByUserName(userInfo.user_name, grades.className)
                            .catch((err) => {
                                console.log(err);
                            })
                    }


                })
                .catch((err) => {
                    console.log(err);
                    if (err == '未登录') {
                        login.login(userInfo.user_name, userInfo.password);
                    }
                })


        }, Math.random() * 5 * 1000);//避免高并发
    }, 30 * 1000);

    checkingInterval.push(temp);
}

//停止运行
exports.stopChecking = function () {
    for (let item of checkingInterval) {
        clearInterval(item);
    }
}

//开始运行
exports.startChecking = function () {
    user.getAllDataFromMySql()
        .then((results) => {

            for (let userInfo of results) {

                // console.log(userInfo.latest_class_name);
                // console.log(userInfo);
                exports.runAUser(userInfo);

            }
        })
        .catch((err) => {
            console.log(err);
        })
}

//重新运行
exports.reRun = function () {
    exports.stopChecking();
    exports.startChecking();
}

//exports.startChecking();//开始运行

