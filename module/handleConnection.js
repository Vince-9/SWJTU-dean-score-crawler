const mysql = require('mysql');
const mysql_config = require('./sensitiveConfig').mysql_config;
// const mysql_config = {
//     host: '',
//     user: '',
//     password: '',
//     database: ''
// };


/**
 * 由于mysql在一段时间内没有访问,会自动断开连接，本模块用于断开连接后自动重连
 */
function handleDisconnection() {
    var connection = mysql.createConnection(mysql_config);
    connection.connect(function (err) {
        if (err) {
            setTimeout('handleDisconnection()', 2000);
        }
    });

    connection.on('error', function (err) {
        console.log('***************mysql connect on error************');
        console.log(err);
        // logger.error('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('db error执行重连:' + err.message);
            handleDisconnection();
        } else {
            throw err;
        }
    });
    exports.connection = connection;
}
handleDisconnection();

//每30分钟发一次请求,防止断开连接
setInterval(() => {
    exports.connection.query('SELECT * FROM user_info', (err, result) => {
        console.log(`按时连接中,防止数据库断开`);
    })
}, 30 * 60 * 1000);

exports.handleDisconnection = handleDisconnection;