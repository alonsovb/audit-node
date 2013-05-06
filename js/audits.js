// -----------------------
// System engine
// -----------------------

// Global variables
var audits = [],
	currentAudit,
	hqs = [],
	// Assets Identifiers start at number 40200
	assetsId = 40200;

// Give some audit samples
// audits = sampleAudits(10, 3, 10);

// Audit class. Contains a building, floor and room properties.
function Audit(headquarter, building, room) {
	this.date      = moment();
	this.hq        = headquarter;
	this.building  = building;
	this.room      = room;
	this.assets    = [];
	this.comment   = '';
	this.completed = false;
}

// Asset class. Each asset has an identifier, a qualitative (state) and quantified score.
function Asset(state, score) {
	this.id      = assetsId++;
	this.present = true;
	this.state   = state;
	this.score   = score;
	this.comment = '';
}

function getAuditById(id, audit) {
	var assets = audit.assets;
	for (var index in assets) {
		if (assets[index].id === id) {
			return assets[index];
		}
	}
}

function getAverageScore(audit) {
	var count = audit.assets.length;
	if (!audit.assets || count === 0) {
		return 0;
	}
	var result = 0;
	for (var i in audit.assets) {
		result += audit.assets[i].score;
	}
	return result / count;
}

function countGood(audit) {
	var count = audit.assets.length;
	if (!audit.assets || count === 0) {
		return 0;
	}
	var result = 0;
	for (var i in audit.assets) {
		if (audit.assets[i].state === 1)
			result++;
	}
	return result;
}

// Returns some sample assets
function sampleAssets(min, max) {
	var assetCount = Math.floor((Math.random()*(max - min))+min),
		assets = [];
	for (var i = 0; i < assetCount; i++) {
		var state = Math.floor(Math.random() * 10 + 1);
		assets.push(new Asset((state < 5 ? 0 : 1), state));
	}
	return assets;
}
// Returns some sample audits (each one with some sample assets)
function sampleAudits(count, minAssets, maxAssets) {
	var audits = [];
	for (var i = 0; i < count; i++) {
		var hq = hqs         [Math.floor(Math.random() * hqs.length)],
			bl = hq.buildings[Math.floor(Math.random() * hq.buildings.length)],
			rm = bl.rooms    [Math.floor(Math.random() * bl.rooms.length)],
			newAudit = new Audit(hq, bl, rm);
		newAudit.assets = sampleAssets(minAssets, maxAssets);
		if (Math.random() > 0.2)
			newAudit.completed = true;
		audits.push(newAudit);
	}
	return audits;
}


// -----------------------
// Interface
// -----------------------
$(function() {

	var $headquarter = $('#n-headquarter'),
		$building    = $('#n-building'),
		$room        = $('#n-room'),
		selHQ, selBuild, selRoom;

	$('#button-login').on('click', function(e) {
		e.preventDefault();
		var $loginname = $('#login-name'),
			$loginpass = $('#login-pass');
		$.ajax({
			url: 'db?do=validate' +
				'&user=' + $loginname.val() +
				'&pass=' + $loginpass.val()
		}).done(function (data) {
			if (data === 'true')
			{
				var currentPage = window.location.href.split('#')[0];
				window.location.href = currentPage + '#main';
			}
			else
				alert('Las credenciales no son válidas');
		});
	});

	// Events on main page
	$('#main').on('pageinit', function() {

		// Load headquarter list
		$.ajax({
			url: 'db?do=getHQ'
		}).done(function(data) {
			hqs = eval("("+data+")");

			for (var i in hqs) {
				var newHQ = $('<option>', {
					text: hqs[i].name
				});
				$headquarter.append(newHQ);
				console.log(hqs[i]._id);
			}
		});

		// Load building list on HQ change
		$headquarter.on('change', function () {
			if (this.selectedIndex < 0) {
				return;
			}
			selHQ = hqs[this.selectedIndex - 1];
			var buildings = selHQ.buildings;

			if (buildings.length > 0) {
				$building.html('');
				$building.append($('<option>', {
					text: 'Building'
				}));

				// Load building list
				for (var index in buildings) {
					var newOption = $('<option>', {
						text: buildings[index].name
					});
					$building.append(newOption);
				}
				$building.selectmenu('refresh');
				$building.selectmenu('enable');

			} else {
				$building.selectmenu('disable');
				$room.selectmenu('disable');
			}
			$room.selectmenu('disable');
		});

		$building.on('change', function() {
			selBuild = selHQ.buildings[this.selectedIndex - 1];
			var rooms = selBuild.rooms;

			if (rooms.length > 0) {
				$room.html('');
				$room.append($('<option>', {
					text: 'Room'
				}));

				// Load room list
				var floors = [$('<optgroup>', {
					label: 'Floor ' + 1
				})];
				for (var index in rooms) {
					var room = rooms[index],
						newOption = $('<option>', {
							text: room.name
						});
					if (room.floor >= floors.length) {
						for (var i = floors.length; i < room.floor; i++) {
							floors.push($('<optgroup>', {
								label: 'Floor ' + (i + 1)
							}));
						}
					}
					floors[parseInt(room.floor, 10) - 1].append(newOption);
				}
				for (var floorIndex in floors) {
					$room.append(floors[floorIndex]);
				}
				$room.selectmenu('refresh');
				$room.selectmenu('enable');

			} else {
				$room.selectmenu('disable');
			}
		});

		$room.on('change', function () {
			selRoom = selBuild.rooms[this.selectedIndex - 1];
			if (selRoom !== undefined && selRoom !== null)
				$('#n-create').button('enable');
			else
				$('#n-create').button('disable');
		});

		// Create new audit
		$('#n-create').on('click', function() {
			var newAudit  = new Audit(selHQ, selBuild, selRoom);

			// Create some sample assets
			/*newAudit.assets = sampleAssets(5, 12);
			// Add audit to main list
			audits.push(newAudit);*/
			// Make it the current audit
			currentAudit = newAudit;
			$.ajax({
				url: 'db?do=audit'
				+'&hq=' + $headquarter.val() 
				+'&building=' + $building.val() 
				+'&room=' + $room.val()
			}).done(function(data) {
				if (data === 'true'){
					// Clean adding inputs
					$building.selectmenu('disable');
					$room.selectmenu('disable');
					$('#n-create').button('disable');
					$('#n-panel').trigger('collapse');
					window.location.href = '#audit';
				}
				else
					window.location.href = '#main';
			});
		});
	});

	// Events on audit page
	$('#audit').on('pagebeforeshow', function() {

		// Check if there's a current audit. If not, go to main screen.
		if (currentAudit === undefined) {
			window.location.href = '#main';
			return;
		}

		$('#audit-info').text(
				currentAudit.hq.name + ', ' +
				currentAudit.building.name + ', ' +
				currentAudit.room.name);

		var template = $.trim($('#asset-item-template').html()),
			content  = '',
			$assetList = $('#asset-list'),
			$comment = $('#audit-comment');

		// Clean asset list
		$assetList.html('');

		// Fill asset list by templating
		$.each(currentAudit.assets, function (index, obj) {
			var text = template.replace( /{{id}}/ig, obj.id );
				text = text.replace(/{{score}}/ig, obj.score);
			if (!obj.present)
				text = text.replace('checked="true"', '');
			content += text;
		});
		$assetList.append(content);
		$comment.val(currentAudit.comment);

		var $assets = $('#asset-list>div');
		$assets.each(function (index, element) {
			var $this = $(this),
				$state = $this.find('select.state'),
				$comment = $this.find('input.comment');
			$state.val(currentAudit.assets[index].state);
			$comment.val(currentAudit.assets[index].comment);
		});

		// Disable controls when viewing completed audits
		if (currentAudit.completed) {
			$comment.attr('disabled', 'disabled');
			$assetList.find('select, input').attr('disabled', 'disabled');
			$('a#n-save').hide();
			$("#n-complete .ui-btn-text").text('Return');
		} else {
			$comment.removeAttr('disabled');
			$assetList.find('select, input').removeAttr('disabled');
			$('a#n-save').show();
			$("#n-complete .ui-btn-text").text('Complete');
		}

		$('#audit').trigger('create');

		// Audit view events
		$('.inroom').on('change', function () {
			var $this = $(this),
				id = $this.closest('.asset-container').data('id'),
				asset = getAuditById(id, currentAudit);
			asset.present = this.checked;
		});
		$('.score').on('change', function () {
			var $this = $(this),
				id = $this.closest('.asset-container').data('id'),
				asset = getAuditById(id, currentAudit);
			asset.score = parseInt($this.val(), 10);
		});
		$('.state').on('change', function () {
			var $this = $(this),
				id = $this.closest('.asset-container').data('id'),
				asset = getAuditById(id, currentAudit);
			asset.state = $this.val();
		});
		$('.comment').on('change', function () {
			var $this = $(this),
				id = $this.closest('.asset-container').data('id'),
				asset = getAuditById(id, currentAudit);
			asset.comment = $this.val();
		});

		$('#n-complete').on('click', function () {
			var comment  = $comment.val();
			currentAudit.comment = comment;
			currentAudit.completed = true;
		});
		$('#n-save').on('click', function () {
			var comment  = $comment.val();
			currentAudit.comment = comment;
		});
		$('#n-delete').on('click', function (e) {
			if (currentAudit === undefined)
				return;
			var confirmDelete = confirm('Do you really want to delete the current audit?');
			if (confirmDelete) {
				var index = audits.indexOf(currentAudit);
				audits.splice(index, 1);
				currentAudit = undefined;
			} else {
				e.preventDefault();
				return;
			}
		});
	});

	// Events on history page
	$('#history').on('pagebeforeshow', function() {
		var $list = $('#h-list'),
			$divider = $.trim($('#history-list-divider').html());

		// Clean history list
		$list.html('');

		// Get divider template
		$list.append($divider.replace(/{{text}}/ig, 'Current').replace(/{{id}}/ig, 'h-current'));
		$list.append($divider.replace(/{{text}}/ig, 'Done').replace(/{{id}}/ig, 'h-done'));
		var $current = $('#h-current'),
			$done    = $('#h-done');
		// Ajax method here, to load audits from db and set audits global var
		$.ajax({
			url: 'db?do=getAudits', 
			async: false
		}).done(function (data) {
			if (data === 'true')
			{
				audits = data;
			}
		});
		// Show list of audits
		for (var index in audits) {
			var audit = audits[index],
				item = $('<li>', {
					class: 'audit-li'
				}),
				link = $('<a>', {
					href: "#audit",
					class: 'audit',
					'data-index': index
				}),
				span = $('<span>', {
					class: 'ui-li-count',
					text: audits[index].assets.length
				}),
				title = $('<h2>', {
					text: audit.room.name
				}),
				direction = $('<p>').append($('<strong>', {
					text: audit.hq.name + ', ' + audit.building.name
				})),
				description = $('<p>', {
					text: 'Total assets: ' + audit.assets.length +
						'. Average score: ' + getAverageScore(audit).toFixed(2) +
						'. Assets in good state: ' + countGood(audit)
				}),
				date = $('<p>', {
					text: audit.date.format('MMM Do, h:mm a'),
					class: "ui-li-aside"
				}),
				dButton = $('<a>', {
					text: 'Delete',
					class: 'delete'
				});
			// Append properties to item
			link.append(title);
			link.append(direction);
			link.append(description);
			link.append(date);
			link.append(span);
			item.append(link);
			if ( ! $.mobile.support.touch )
				item.append(dButton);

			// Add to corresponding divider
			if (audits[index].completed)
				$done.after(item);
			else
				$current.after(item);
		}
		// Refresh the list view to mirror changes
		$list.listview('refresh');

		// Load selected audit on click
		$('a.audit').on('click', function () {
			var index = $(this).data('index');
			currentAudit = audits[index];
		});

		if ( ! $.mobile.support.touch ) {
			// Remove the class that is used to hide the delete button on touch devices
			$( "#list" ).removeClass( "touch" );
			// Click delete split-button to remove list item
			$( ".delete" ).on( "click", function() {
				var listitem = $( this ).closest( "li.audit-li" );
				confirmRemoveAudit( listitem );
			});
		} else {
			$('#mobile-gesture-guide').text('Swipe left or right any audit in the list to remove it.');
		}
		$list.on('swipeleft swiperight', 'li.audit-li', function (e) {
			confirmRemoveAudit($(this));
		});

		function confirmRemoveAudit(li) {
		var answer = confirm('Do you really want to remove this audit?');
		if ( answer ) {
			// Remove from data
			var auditIndex = parseInt(li.children('a.audit').data('index'), 10);
			audits.splice(auditIndex, 1);
			currentAudit = undefined;

			// Remove list item
			li.remove();
			$list.listview('refresh');
		}
	}
	});
});