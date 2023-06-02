var db = require('./db.js');
var template = require('./template.js');
var url = require('url');
var qs = require('querystring');


exports.home = function(request, response) {
	db.query(`SELECT * FROM topic`, function(error, topics){
		var title = "Home";
		var description = "Welcome!";
		var list = template.list(topics);
		var body = `<h2>${title}</h2><p>${description}</p>`;
		var control = `<a href = "/author">author</a> <a href="/create">create</a>`;
		var html = template.HTML(title, list, body, control);
		response.writeHead(200);				
		response.end(html);
	});
};

exports.page = function(request, response) {
	db.query(`SELECT * FROM topic`, function(error, topics){
		var queryData = url.parse(request.url, true).query;		
		if(error){throw error;}
		var tempQuery = `SELECT * FROM topic LEFT JOIN author ON topic.author_id = author.id WHERE topic.id = ?`;
		db.query(tempQuery,[queryData.id],  function(error2, topic){
			if(error2) {throw error2;}
			var title = topic[0].title;
			var description = topic[0].description;
			var list = template.list(topics);
			var body = `<h2>${title}</h2>${description}<p>by ${topic[0].name}</p>`;
			var control = `
			<a href = "/create">create</a>
			<a href = "/update?id=${queryData.id}">update</a>
			<form action="delete_process" method="post">
				<input type= "hidden" name ="id" value = "${queryData.id}">
				<input type= "submit" value="delete">						
			</form>
			`;
			var html = template.HTML(title, list, body, control);

			response.writeHead(200);
			response.end(html);						
		})	
	});	
};

exports.create = function(request, response) {
	db.query(`SELECT * FROM topic`, function(error, topics){
		db.query(`SELECT * FROM author`, function(error2, authors){
			var title = `Create`;
			var list = template.list(topics);
			var body = `
			<form action = "/create_process" method = "post">
				<p><input type = "text" name = "title" placeholder = "title"></p>
				<p>
					<textarea name = "description" placeholder = "description"></textarea>
				</p>
				<p>
					${template.authorSelect(authors)}
				</p>
				<p>
					<input type = "submit">
				</p>
			</form>			
			`;
			var control = `<a href = "/create">create</a>`;
			var html = template.HTML(title, list, body, control);
			response.writeHead(200);
			response.end(html);				
		});
	});	
};

exports.create_process = function(request, response){
	var body = '';
	request.on('data', function(data){
		body = body + data;
	});
	request.on('end', function(){
		var post = qs.parse(body);
		var tempQuery = `
		INSERT INTO topic (title, description, created, author_id)
			VALUES(?,?,NOW(),?)			
		`;
		db.query(tempQuery, [post.title, post.description, post.author], function(error, result){
			if(error)	{throw error;}
			// console.log(result);
			response.writeHead(302, {Location: `/?id=${result.insertId}`});
			response.end();
		});
	});	
};

exports.update = function(request, response){
	db.query(`SELECT * FROM topic`, function(error, topics){
		var queryData = url.parse(request.url, true).query;		
		if(error){throw error;}
		db.query(`SELECT * FROM topic WHERE ID = ?`, [queryData.id], function(error2, topic){
			if(error2){throw error2;}
			db.query(`SELECT * FROM author`, function(error3, authors) {
				var list = template.list(topics);
				var body = `
				<form action = "/update_process" method = "post">
					<input type = "hidden" name = "id" value = "${topic[0].id}">
					<p><input type = "text" name = "title" value = "${topic[0].title}" placeholder = "title"></p>
					<p><textarea name = "description" placeholder = "description">${topic[0].description}</textarea></p>
					<p>${template.authorSelect(authors, topic[0].author_id)}</p>
					<p><input type = "submit"></p>
				</form>
				`;
				var control = `<a href = "/create">create</a> <a href = "/update?id=${topic[0].id}">update</a>`
				var html = template.HTML(topic[0].title, list, body, control);
				response.writeHead(200);
				response.end(html);					
			});
		});
	});	
};

exports.update_process = function(request, response){
	var body = '';
	request.on('data', function(data){
		body = body + data;
	});
	request.on('end', function(){
		var post = qs.parse(body);
		var tempQuery = `
		UPDATE topic SET title = ?, description = ?, author_id = ? WHERE id = ?
		`;
		db.query(tempQuery, [post.title, post.description, post.author, post.id], function(error, result){
			if(error){throw error;}
			response.writeHead(302, {Location: `/?id=${post.id}`});
			response.end();
		});
	});	
};

exports.delete_process = function(request, response){
	var body = '';
	request.on('data', function(data){
		body = body + data;
	});
	request.on('end', function(){
		var post = qs.parse(body);
		var tempQuery = `
		DELETE FROM topic WHERE id = ?
		`;
		db.query(tempQuery, [post.id], function(error, result){
			if(error) {throw error;}
			response.writeHead(302, {Location: '/'});
			response.end();
		});
	});	
};