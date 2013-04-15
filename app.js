var http = require('http'),
	path = require('path'),
	fs = require('fs');

fs.readFile('./index.html', function (err, html) {
	if (err) {
		throw err;
	}
	http.createServer(function(request, response) {

		var filePath = '.' + request.url;
		if (filePath == './')
			filePath = './index.htm';

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