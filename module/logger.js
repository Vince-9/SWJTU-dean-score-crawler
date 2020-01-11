const fs = require('fs');

exports.log = (...args) => {
    console.log(`logger执行了`);
    let data = new Date(Date.now()) + ' ： ';
    for (let item of args) {
        data += String(item);
    }
    data = '\n' + data;
    data += '\r\n';
    console.log(data);
    fs.appendFile('./log.txt', data, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('文件内容已追加');
        }
    });
}

exports.logErr = (...args) => {
    console.log(`logger ERR执行了`);
    let data = new Date(Date.now()) + ' ： ';
    for (let item of args) {
        data += String(item);
    }
    data = '\n' + data;
    data += '\r\n';
    console.log(data);
    fs.appendFile('./logErr.txt', data, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('文件内容已追加');
        }
    });
}