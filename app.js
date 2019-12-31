const express = require('express');
const fs = require('fs');
const router = require('./router/router');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const Store = require('express-mysql-session');
const config = require('./module/sensitiveConfig');

const app = express();

app.use('/node_modules/', express.static('./node_modules/'));//映射静态资源
app.use('/public/', express.static('./public/'));

app.use(session({
    secret: 'vincent targaryen', //secret的值建议使用随机字符串
    cookie: { maxAge: 15 * 24 * 60 * 60 * 1000 }, // 过期时间（毫秒）
    resave: false,
    saveUninitiailzed: true,
    store: new Store(config.mysql_config)
}));//session

app.engine('html', require('express-art-template'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(router);

const port = 80;
app.listen(port, () => {
    console.log('教务成绩查询app running ' + port + '...');
});