var http  = require('http'),
	path  = require('path'),
	fs    = require('fs'),
	url   = require('url'),
	model = require('./model.js');

fs.readFile('./index.html', function (err, html) {
	if (err) {
		throw err;
	}
	http.createServer(function(request, response) {

		// Database section
		var pathName = url.parse(request.url).pathname,
			query    = url.parse(request.url, true).query;
		if (pathName == '/db')
		{
			if (query['do'] !== null)
				switch(query['do']) {
					case 'validate':
						var user = query['user'],
							pass = query['pass'];
						if (user !== null && pass !== null) {
							model.validate(user, pass, function(err, data) {
								response.writeHead(200, { 'Content-Type': 'text/plain' });
								if (err || !data || Object.keys(data).length < 1)
									response.end('false', 'utf-8');
								else {
									response.end('true', 'utf-8');
								}
							});
						}
						break;
					case 'getHQ':
						model.getHQ(function (err, data) {
							if (err || !data || Object.keys(data).length < 1)
								response.end('false', 'utf-8');
							else
								response.end(JSON.stringify(data), 'utf-8');
						});
				}
			return;
		}

		var filePath = '.' + request.url;
		if (filePath == './')
			filePath = './index.html';

		var extname = path.extname(filePath);
		var contentType = 'text/html';
		switch (extname) {
			case '.js':
				contentType = 'text/javascript';
				break;
			case '.css':
				contentType = 'text/css';
				break;
		}

		fs.exists(filePath, function(exists) {

			if (exists) {
				fs.readFile(filePath, function(error, content) {
					if (error) {
						response.writeHead(500);
						console.log('Error 500');
						response.end();
					}
					else {
						response.writeHead(200, { 'Content-Type': contentType });
						response.end(content, 'utf-8');
					}
				});
			}
			else {
				response.writeHead(404);
				console.log('Error 404. Coudn\'t find ' + filePath);
				response.end();
			}
		});
	}).listen(8000);
});