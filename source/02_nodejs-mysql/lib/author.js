var db = require('./db.js');
var template = require('./template.js');
var url = require('url');
var qs = require('querystring');

exports.home = function(request, response){
	db.query("SELECT * FROM author", function(error, authors){
		if(error){throw error;}		
		db.query("SELECT * FROM topic", function(error2, topics){
			if(error2){throw error2;}
			var title = "author";
			var list = template.list(topics);
			var body = `
			<h2>${title}</h2>			
			${template.authorStyle()}			
			${template.authorsTable(authors)}
			<form action = "author/create_process" method = "post">
				<p><input type = "text" name = "name" placeholder = "name"></p>
				<p><textarea name = "profile" placeholder = "profile"></textarea></p>
				<p><input type = "submit"></p>
			</form>
			`;
			var control = "<a href = '../'>back</a>";
			var html = template.HTML(title, list, body, control);
			response.writeHead(200);
			response.end(html);			
		});
	});
};

exports.create_process = function(request, response){
	var body = "";
	request.on('data', function(data){
		body = body + data;
	});
	request.on('end', function(){
		var post = qs.parse(body);
		var tempQuery = `
		INSERT INTO author (name, profile)
		VALUES(?,?)
		`;
		
		db.query(tempQuery, [post.name, post.profile], function(error, result){
			if(error){throw error;}
			response.writeHead(302, {Location: "/author"});
			response.end();
		});
	});
};
exports.update = function(request, response){
	var queryData = url.parse(request.url, true).query;
	var tempQuery = `
		SELECT * FROM author WHERE id = ?
	`;
	db.query(tempQuery, [queryData.id], function(error, author){
		tempQuery = `
			SELECT * FROM author
		`;
		db.query(tempQuery, function(error2, authors){
			var title = "author";
			var list = template.list(authors);
			var body = `
			<h2>${title}</h2>			
			${template.authorStyle()}			
			${template.authorsTable(authors)}			
			<form action = "update_process" method = "post">
				<input type = "hidden" name = "id" value = "${author[0].id}">
				<p><input type = "text" name = "name" placeholder = "name" value = "${author[0].name}"></p>
				<p><textarea name = "profile" placeholder = "profile">${author[0].profile}</textarea></p>
				<p><input type = "submit"></p>
			</form>
			`;
			var control = "<a href = '../'>back</a>";
			var html = template.HTML(title, list, body, control);
			response.writeHead(200);
			response.end(html);
		});		
	});
};

exports.update_process = function(request, response){
	var body = '';
	request.on('data', function(data){
		body += data;
	});
	request.on('end', function(){
		var post = qs.parse(body);
		console.log(body);
		var tempQuery = `		
			UPDATE author SET name = ?, profile = ? WHERE id = ?
		`;
		db.query(tempQuery, [post.name, post.profile, post.id], function(error, result){
			if(error){throw error;}
			response.writeHead(302, {Location: "/author"});
			response.end();
		});		
	});
};
exports.delete_process = function(request, response){
	var body = '';
	request.on('data', function(data){
		body += data;
	});
	request.on('end', function(){
		var post = qs.parse(body);
		var tempQuery = `
			DELETE FROM author WHERE id = ?
		`;
		db.query(tempQuery, [post.id], function(error, result){
			if(error){throw error;}
			tempQuery = `
				DELETE FROM topic WHERE author_id = ?
			`;
			db.query(tempQuery, [post.id], function(error2, result2){
				if(error2){throw error2;}
				response.writeHead(302, {Location: "/author"});
				response.end();				
			});
		});
	});   
}