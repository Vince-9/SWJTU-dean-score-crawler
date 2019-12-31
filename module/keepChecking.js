/**
 * 不断地查询新成绩
 */
const user = require('./user.js');
const getLatestGrade = require('./getLatestGrade.js');
const email = require('./email.js');
const login = require('./loginToDean');
const logger = require('./logger');

const delayTime = 20;// 每次查询的随机延迟（秒）
const roundTime = 60;// 每轮查询的间隔（秒）

let checkingInterval = [];
let globalUserInfo = [];// 从数据库中查询到的用户信息

function check(userInfo) {
    setTimeout(() => {
        //  console.log(userInfo.latest_class_name);

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
                            exports.reRunAUser(userInfo.user_name);
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
                    login.login2(userInfo.user_name, userInfo.password);
                }
            })


    }, Math.random() * delayTime * 1000); //避免高并发
}

exports.runAUser = function (userInfo) {
    check(userInfo);
    let temp = setInterval(() => {
        check(userInfo);
    }, roundTime * 1000);

    checkingInterval.push({
        interval: temp,
        userName: userInfo.user_name
    });
}

//停止运行
exports.stopChecking = function () {
    for (let item of checkingInterval) {
        clearInterval(item.interval);
    }
}

//开始运行
exports.startChecking = function () {
    user.getAllNoShutdownDataFromMySql()
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

/**
 * 更新内存中的用户信息
 * @param
 */
exports.updateUserInfoInMeo = function () {
    user.getAllNoShutdownDataFromMySql()
        .then(result => {
            globalUserInfo = result;
        })
}

/**
 * 停止一名用户的执行
 */
exports.stopAUser = function (userName) {
    checkingInterval.forEach((item, index) => {
        if (item.userName == userName) {
            clearInterval(item.interval);
            checkingInterval.splice(index, 1);
        }
    })
}

/**
 * 更新内存中一名用户的信息，并重新运行它
 */
exports.reRunAUser = function (userName) {
    exports.stopAUser(userName);
    user.findUserByName(userName)
        .then(res => {
            exports.runAUser(res[0]);
        })
        .catch(err => {
            console.log(err);
        })
}

//exports.startChecking();//开始运行