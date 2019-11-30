/**
 * 不断地查询新成绩
 */
const user = require('./user.js');
const getLatestGrade = require('./getLatestGrade.js');
const email = require('./email.js');

let checkingInterval = [];


exports.runAUser = function (userInfo) {
    let temp = setInterval(() => {
        setTimeout(() => {

            console.log(userInfo.latest_class_name);

            getLatestGrade.getGradeBySid(userInfo.session_id)
                .then((grades) => {

                    if (grades && grades.latest_class_name != userInfo.className) {
                        //保存新的课程名到数据库
                        return user.saveClassNameByUserName(userInfo.userName, grades.className)
                            .then(() => {
                                email.sendMailNewGrade(userInfo.email, grades);
                            })

                        //发送邮件
                    } else {
                        console.log('持续查询中, 还没有新成绩');
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

                console.log(userInfo.latest_class_name);

                exports.runAUser(userInfo);

            }
        })
        .catch((err) => {
            console.log(err);
        })
}

exports.startChecking();//开始运行

