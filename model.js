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
/*function Audit(headquarter, building, room) {
	this.date      = new Date();
	this.hq        = headquarter;
	this.building  = building;
	this.room      = room;
	this.assets    = [];
	this.comment   = '';
	this.completed = false;
}*/

function newAudit(headquarter, building, room, callback){
	var date = new Date(); // Current date on server
	//var audit = new Audit(headquarter, building, room);
	db.audits.save({'date': date, 'hq': headquarter, 'building': building,
	'room': room, 'assets': [], 'comment': '', 'completed': false}, function(err, data){
		callback(err,data);
	});
	/*db.audits.save(audit, function(err,data){
		callback(err,data);
	});*/
}

function saveAudit(audit, callback) {
	db.audits.save(autid, function(err, data) {
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