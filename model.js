// connection params
var databaseURL = "mongodb://localhost/audits",
	collections = ["audits", "users"],
	db          = require('mongojs').connect(databaseURL, collections);

function validate(user, pass, callback) {
	db.users.find({'name': user, 'pass': pass}, function(err, data) {
		callback(err, data);
	});
}

exports.validate = validate;