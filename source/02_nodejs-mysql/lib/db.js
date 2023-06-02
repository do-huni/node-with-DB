var mysql = require('mysql');
//실제 서비스시에는 버전관리시스템에서 예외설정하고 db.template.js 사용
var db = mysql.createConnection({
	host:'localhost',
	user:'orangNLP',
	password:'ehgns016295',
	database:'opentutorials'
});
db.connect();
module.exports = db;