(function () {
    window.mainApp = new Vue({
        el: '#container',
        data: {
            username: '',
            password: '',
            email: '',
            CDKEY: 'test',
            preventClick: false, //用于禁用按钮的点击,防止多次提交
            toogleForm: 0, //控制表单的切换
            randPath: '', //验证码图片url
            sid: '', //服务器返回的教务网的sid
            randString: '', //用户输入的验证码
            randCount: 0, //获取验证码的次数
            coverText: '提交中',
            userCount: 0 //系统中的用户数量
        },
        methods: {
            handleMainSubmitClick() {
                if (this.preventClick) return; //防止重复提交
                this.randCount = 0; //重置验证码获取次数
                this.preventClick = true;
                let formData = {
                    username: this.username.trim(),
                    password: this.password.trim(),
                    email: this.email.trim(),
                    CDKEY: this.CDKEY.trim()
                };
                for (let item in formData) {
                    if (formData[item].length == 0) {
                        alert('表单不完整');
                        this.preventClick = false;
                        return;
                    }
                }
                let emailPat = /.+@(qq|foxmail|126|163|gmail|outlook|hotmail)\.com$/i;
                if (!emailPat.test(this.email.trim())) {
                    alert('请检查你的邮箱地址，邮箱仅支持qq、foxmail、163、126、outlook、gamil');
                    this.preventClick = false;
                    return;
                }
                axios.post('/GradeNotice', formData)
                    .then((result) => {
                        this.preventClick = false;
                        console.log(result);
                        alert(result.data.msg);
                        if (result.data.code == 1) {
                            this.toToogleForm(1); //切换到验证码页
                        }
                    }).catch((err) => {
                        this.preventClick = false;
                        console.log(err);
                    });
            },

            //提交验证码
            handleRandCodeSubmitClick() {
                if (this.preventClick) return;

                this.preventClick = true;

                if (this.username.trim().length > 0 && this.randString.trim().length > 0 && this.sid.length > 0) {
                    axios.post('/postRand', {
                        username: this.username.trim(),
                        randString: this.randString.trim(),
                        sid: this.sid
                    })
                        .then((result) => {
                            //登录成功
                            if (result.data.loginStatus == 1) {
                                this.username = '';
                                alert('您已成功登录，请查看邮箱是否收到邮件哦~\n可以关掉这个页面了');
                                location.reload();
                            } else {
                                this.getRand();
                                alert(result.data.loginMsg);
                            }
                        })
                        .then(() => {
                            this.preventClick = false;
                        })
                        .catch((err) => {
                            this.preventClick = false;
                            console.log(err);
                        })
                }
            },

            toToogleForm(n) {
                this.toogleForm = n;
                if (n == 1 &&
                    this.randCount == 0 &&
                    this.username.trim().length == 10) {
                    //发送获取验证码请求
                    this.getRand();
                }
            },

            //获取验证码
            getRand() {
                if (this.username.trim().length != 10) {
                    alert('请输入完整的学号');
                    return;
                }
                this.randCount++; //记录获取验证码的次数
                axios.post('/getRand', {
                    username: this.username.trim(),
                    // sid: this.sid
                })
                    .then((result) => {
                        console.log(result);
                        this.sid = result.data.sid;
                        this.randPath = `../public/data/randImg/${this.username.trim()}.jpg?test=${new Date().getTime()}`;
                    }).catch((err) => {
                        console.log(err);
                    });

            }
        }
    })

    //控制刷打开页面时,出现的录入页还是验证码页
    let page = getDataFromLocationHref('page') || 0;
    console.log(page);
    if (page == 1) {
        window.mainApp.randCount++;
        window.mainApp.toToogleForm(1);
    }

    setInterval(() => {
        window.mainApp.coverText += '.';
        if (window.mainApp.coverText.length > 9) {
            window.mainApp.coverText = '提交中';
        }
    }, 300);
})()

function getDataFromLocationHref(cname) {
    console.log(document.location.href);
    let temp = document.location.href.split('?');
    if (temp.length <= 1) {
        return '';
    }
    temp = temp[1].split('&');
    for (let item of temp) {
        if (item.indexOf(cname) === 0) {
            return item.split('=')[1];
        }
    }
}

async function getUserCount() {
    let uc = await axios.get('/grade-usercount');
    window.mainApp.userCount = uc.data.userCount;
}

window.onload = () => {
    getUserCount();
}