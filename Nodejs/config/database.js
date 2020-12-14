var mysql = require('mysql');
var connection = mysql.createConnection({
     host: 'localhost',
    // host:'159.89.162.62',
    //host:'199.79.62.108',
    //port:'3306',
    // host:'199.79.62.108',
    user: 'root',
     password: '',
    // database: 'objective_done',
    database:'objectivedone',
});

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = connection;