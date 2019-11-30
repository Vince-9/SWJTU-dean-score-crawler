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

            // console.log(userInfo.latest_class_name);

            getLatestGrade.getGradeBySid(userInfo.session_id)
                .then((grades) => {

                    if (grades && grades.className != userInfo.latest_class_name) {
                        //保存新的课程名到数据库
                        return user.saveClassNameByUserName(userInfo.user_name, grades.className)
                            .then(() => {
                                // 更新内存中的用户数据
                                exports.reRun();
                                // 发送邮件
                                email.sendMailNewGrade(userInfo.email, grades);
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
exports.reRun = function(){
    exports.stopChecking();
    exports.startChecking();
}

exports.startChecking();//开始运行

