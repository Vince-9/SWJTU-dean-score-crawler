let vm = new Vue({
    el: '#container',
    data: {
        username: '',
        password: '',
        email: '',
        toogleForm: 0,
        userInfo: { status: 0 },// 从服务器获取的用户数据
        showCover: false,
        newEmail: '',// 设置新的邮箱
    },
    methods: {
        handleLoginSubmitClick: async () => {
            vm.showCover = true;
            let loginRes = await axios.post('/grade-login', {
                userName: vm.username,
                password: vm.password
            });
            vm.showCover = false;
            if (loginRes.data.isLogin == 1) {
                vm.toogleForm = 1;
            } else {
                alert('登录失败');
            }
            testLogin();
        },

        handleTurnOnBtnClick: async () => {
            vm.showCover = true;
            await axios.get('/grade-setstatus?status=1');
            getUserInfo();
            vm.showCover = false;
        },

        handleShutdownBtnClick: async () => {
            vm.showCover = true;
            await axios.get('/grade-setstatus?status=0');
            getUserInfo();
            vm.showCover = false;
        },

        handleSetEmailBtnClick() {
            vm.toogleForm = 2;
        },

        handleSetEmailSubmitClick: async () => {
            if (vm.newEmail.trim().length == 0) {
                alert('请输入完整的邮箱');
                return;
            }
            vm.showCover = true;
            await axios.get(`/grade-updateemail?email=${vm.newEmail}`);
            await getUserInfo();
            vm.showCover = false;
            vm.toogleForm = 1;
        },

        handleSetEmailCancleClick() {
            vm.toogleForm = 1;
        },

        handleLogoutBtnClick: async () => {
            vm.showCover = true;
            await axios.get('/grade-logout');
            vm.toogleForm = 0;
            vm.showCover = false;
        }
    }
})

let isLogin = 0;

async function testLogin() {
    let loginRes = await axios.post('/grade-testlogin', {});
    isLogin = loginRes.data.isLogin;
    vm.username = loginRes.data.username;
    if (isLogin == 1) {
        getUserInfo();
        vm.toogleForm = 1;
        vm.email = loginRes.data.email;
    }
}

async function getUserInfo() {
    if (!isLogin)
        return;
    let userInfo = await axios.get('grade-getuserinfo');
    vm.userInfo = userInfo.data;
    vm.email = userInfo.data.email;
}

window.onload = testLogin;