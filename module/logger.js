const fs = require('fs');

exports.log = (...args) => {
    console.log(`logger执行了`);
    let data = new Date(Date.now() + 8 * 60 * 60 * 1000) + ' ： ';
    for (let item of args) {
        data += String(item);
    }
    data += '\n';
    console.log(data);
    fs.appendFile('./log.txt', data, (err) => {
        if (err) {
            console.log(err);
        }else{
            console.log('文件内容已追加');
        }
    });
}