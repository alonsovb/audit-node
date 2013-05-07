// connection params
var databaseURL = "mongodb://localhost/audits",
	collections = ["audits", "users", "hqs"],
	db          = require('mongojs').connect(databaseURL, collections);

function validate(user, pass, callback) {
	db.users.find({'name': user, 'pass': pass}, function(err, data) {
		callback(err, data);
	});
}

function getHQ(callback) {
	db.hqs.find({}, function(err, data) {
		callback(err, data);
	});
}

function getAudits(callback){
	db.audits.find({}, function(err, data){
		callback(err, data);
	});
}

function getAssets(headquarter, building, room, callback){
	getHQ(function(err,hqs) {
		for (var hq in hqs){
			if(hqs[hq].name === 'Sede San Carlos'){
				for (var bd in hqs[hq].buildings){
					if(hqs[hq].buildings[bd].name === 'Dinning Hall'){
						for(var rm in hqs[hq].buildings[bd].rooms){
							if(hqs[hq].buildings[bd].rooms[rm].name === 'Soda'){
								callback(hqs[hq].buildings[bd].rooms[rm].assets);
								break;
							}
						}
					}
				}
			}
		}
	});
}

function newAudit(headquarter, building, room, callback){
	var date = new Date(); // Current date on server
	console.log('new audit model');
	getAssets(headquarter, building, room, function (assets) {
		for(var asset in assets){
			assets[asset].state   = 1;
			assets[asset].present = true;
			assets[asset].score   = 10;
			assets[asset].comment = '';
		}
		var audit = {'date': date, 'hq': headquarter, 'building': building,
		'room': room, 'assets': assets, 'comment': '', 'completed': false};
		db.audits.insert(audit, function(err, data){
			callback(err,audit);
		});
	});
	
}

function saveAudit(audit, callback) {
	db.audits.save(audit, function(err, data) {
		callback(err, data);
	});
}

function removeAudit(id, callback) {
	// TODO
}

exports.validate    = validate;
exports.getHQ       = getHQ;
exports.getAudits   = getAudits;
exports.newAudit    = newAudit;
exports.saveAudit   = saveAudit;
exports.removeAudit = removeAudit;