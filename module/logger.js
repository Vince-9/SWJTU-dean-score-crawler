const fs=require('fs');

exports.log=function(data){
    data = new Date(Date.now() + 8 * 60 * 60 * 1000) + ' ' + data +'\n';
    fs.appendFile('../log.txt',data);
}