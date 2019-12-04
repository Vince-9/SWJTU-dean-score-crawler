const express = require('express');
const fs = require('fs');
const router = require('./router/router');
const bodyParser = require('body-parser');

const app = express();

app.use('/node_modules/', express.static('./node_modules/'));//映射静态资源
app.use('/public/', express.static('./public/'));

app.engine('html', require('express-art-template'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(router);

const port=80;
app.listen(port, () => {
    console.log('成绩查询app running '+port+'...');
});