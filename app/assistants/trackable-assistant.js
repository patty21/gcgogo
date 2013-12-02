function TrackableAssistant(params) {
	this.params = params;
}

TrackableAssistant.prototype.setup = function() {
	//this.controller.stageController.setWindowOrientation('free');
	if(this.params['tbcode']) {
		this.controller.get('trackable-title').update(this.params['tbcode']);
	}
	this.controller.get('loading-spinner').show();
	/* setup widgets here */

	/* add event handlers to listen to events from widgets */
	this.trackableOwnerClickHandle = this.trackableOwnerClickHandle.bind(this);
	this.controller.listen('trackable-owner-row', Mojo.Event.tap, this.trackableOwnerClickHandle);

	this.trackableLocationClickHandle = this.trackableLocationClickHandle.bind(this);
	this.controller.listen('trackable-location-row', Mojo.Event.tap, this.trackableLocationClickHandle);

	
	this.openMap = this.openMap.bind(this);
	this.controller.listen('trackable-traveled-row', Mojo.Event.tap, this.openMap);
	
	this.controller.setupWidget('loading-spinner',
		this.spinnerLAttrs = {
			spinnerSize: 'large'
		},
		this.spinnerModel = {
			spinning: true
		}
	);


	/* Main Menu */
	this.appMenuModel = {
		'visible': true,
		'items': [
			Mojo.Menu.editItem,
			{'label': $L("Reload trackable"), 'command': 'reloadtrackable' },
		]
	};
	this.controller.setupWidget(Mojo.Menu.appMenu, {'omitDefaultItems': true}, this.appMenuModel);
	/* Command menu */
	this.commandMenuItem2 = {'label': 'Favourite', 'icon': 'make-vip', 'toggleCmd': 'nofavorite', 'items' :[
		{'label': 'Favourite', 'icon': 'make-vip', 'command': 'favourite'}
	]};
	this.commandMenuItem1 = {items: [
				{'label': $L("Back"), 'icon': 'back', 'command': 'goback'},
				{'label': $L("More info"), 'icon': 'info', 'command': 'info'},
//				{label:'Users note', icon:'attach', command:'note', disabled: true},
				{'label': $L("Logs"), 'icon': 'search', 'command': 'logs'}
	]};
	if( ! gcGogo.isTouchpad() ){
		this.commandMenuItem1.items.shift();
	}
	this.commandMenuModel = {
		'items':	[
			this.commandMenuItem1,
			this.commandMenuItem2,
			this.commandMenuItem3 = {'label': $L("Post log"), 'icon': 'send', 'command': 'log'} // Preparation for post log
		],
		'visible': false
	}
	this.controller.setupWidget(Mojo.Menu.commandMenu, {'menuClass': 'no-fade'},
		this.commandMenuModel
	);
	
	if (Geocaching.db != null) {
		var item = [];
		Geocaching.db.transaction( 
			(function (transaction) {
				var query, value;
				if(this.params['tbcode']) {
					query = 'select * from "trackables" where "tbcode"= ?;';
					value = this.params['tbcode'];
				} else
				if(this.params['id']) {
					query = 'select * from "trackables" where "id"= ?;';
					value = this.params['id']
				} else {
					query = 'select * from "trackables" where "guid"= ?;';
					value = this.params['guid']
				}
				transaction.executeSql(query, [value],
					function(transaction, results) {
						try {
							var trackables = results.rows.length;
							if(trackables == 0) throw("Not in database");
							delete(trackables);
							
							item = results.rows.item(0);

							this.params['tbcode'] = item['tbcode'];
							trackable[this.params['tbcode']] = unescape(item['json']).evalJSON();
							
							try {
								if(item['favourite'] == 1)
									trackable[this.params['tbcode']].favourite = true;
							} catch(e) {}

							trackable[this.params['tbcode']].updated = item['updated'];

							this.showTrackableDetail();
						} catch(e) {
							Mojo.Log.error(Object.toJSON(e));
							this.reloadTrackable();
						}
					}.bind(this)
				); 
			}).bind(this) 
		);
	} else {
		Geocaching.accounts['geocaching.com'].loadTrackable(this.params,
			this.showTrackableDetail.bind(this),
			function(message) {
				this.controller.get('loading-spinner').hide();
				this.showPopup(null, $L("Problem"), message, function() { Mojo.Controller.stageController.popScene(); });
				return false;
			}.bind(this)
		);
	}
	
}

TrackableAssistant.prototype.activate = function(event) {
}

TrackableAssistant.prototype.deactivate = function(event) {
}

TrackableAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('trackable-owner-row'), Mojo.Event.tap, this.trackableOwnerClickHandle);
	Mojo.Event.stopListening(this.controller.get('trackable-traveled-row'), Mojo.Event.tap, this.openMap);
}

TrackableAssistant.prototype.showTrackableDetail = function() {
	this.controller.get('trackable-title').update(this.params['tbcode']);
	this.controller.get('trackable-icon').innerHTML = '<img class="gc-icon" src="http://www.geocaching.com/images/wpttypes/'+ trackable[this.params['tbcode']].type +'.gif" /> ';
	this.controller.get('trackable-icon').className = 'icon img';
	this.controller.get('trackable-name').update(trackable[this.params['tbcode']].name);

	try {
		var updatedDate = new Date();
		updatedDate.setTime(trackable[this.params['tbcode']].updated *1000);
		this.controller.get('trackable-updated').update(Mojo.Format.formatDate(updatedDate, 'medium'));

		var tsExpired = Math.round(new Date().getTime() / 1000)-(5*24*60*60);
		var tsOutdated = Math.round(new Date().getTime() / 1000)-(2*24*60*60);
		// Trackable is outdated after 5 days
		if(trackable[this.params['tbcode']].updated < tsOutdated) {
			Mojo.Controller.getAppController().showBanner({'messageText': $L("Some data can be outdated.")}, '', 'trackable');
		}
		if(trackable[this.params['tbcode']].updated < tsExpired) {
			this.controller.get('cache-title').innerHTML += ' <img src="images/outdated.png" />';
		}
	} catch(e) { }

	this.controller.get('trackable-owner').update(trackable[this.params['tbcode']].owner);
	this.controller.get('trackable-released').update(trackable[this.params['tbcode']].released);
	this.controller.get('trackable-origin').update(trackable[this.params['tbcode']].origin);
	this.controller.get('trackable-location').update(trackable[this.params['tbcode']].location);
	this.controller.get('trackable-about').update(trackable[this.params['tbcode']].about);
	this.controller.get('trackable-goal').update(trackable[this.params['tbcode']].goal);

	if(trackable[this.params['tbcode']].image) {
		this.controller.get('trackable-image').update('<img src="'+ trackable[this.params['tbcode']].image +'" style="max-width:100%" />');
	} else {
		this.controller.get('trackable-image').update($L("No images"));
	}
	this.controller.get('trackable-traveled').update(trackable[this.params['tbcode']].traveled);

	if(trackable[this.params['tbcode']].favourite) {

		this.commandMenuItem2 = {'label': 'Favourite', 'icon': 'make-vip', 'toggleCmd': 'favourite', 'items': [
			{'label': 'Favourite', 'icon': 'make-vip', 'command': 'favourite'}
		]};
		this.commandMenuModel['items'] = [
			this.commandMenuItem1,
			this.commandMenuItem2,
			this.commandMenuItem3
		];
		if( gcGogo.isTouchpad() ){
			this.commandMenuModel['items'].unshift(this.commandMenuItem0);
		}
		this.controller.modelChanged(this.commandMenuModel);
	}
	
	this.controller.get('loading-spinner').hide();
	this.controller.get('trackable-detail').show();

	// Show command menu
	this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
}


TrackableAssistant.prototype.showPopup = function(event, title, message, onChoose) {
	if(typeof(onChoose) != 'function') {
		onChoose = function() {}
	}
	this.controller.showAlertDialog({
		'onChoose': onChoose,
		'title': title,
		'message': message,
		'choices': [{'label': $L("Close"), 'value': 'close', 'type': 'negative'}]
	});
}

TrackableAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.command) {
		switch(event.command) {
			case 'info':
				if(this.controller.get('trackable-detail').className.indexOf('gc-basic') != -1) {
					this.controller.get('trackable-detail').className = this.controller.get('trackable-detail').className.replace(/gc-basic/g, '');
				} else {
					this.controller.get('trackable-detail').className += ' gc-basic';
				}
			break;
			case 'logs':
				this.controller.stageController.pushScene('trackablelogs', this.params['tbcode']);
			break;
			case 'log':
				this.controller.stageController.pushScene('postlog-trackables', this.params['tbcode']);
			break;
			case 'reloadtrackable':
				this.reloadTrackable();
			break;
			case 'favourite':
				var favourite;
				if(trackable[this.params['tbcode']].favourite) {
					favourite = 0;
					trackable[this.params['tbcode']].favourite = false;
				} else {
					favourite = 1;
					trackable[this.params['tbcode']].favourite = true;
				}

				Geocaching.db.transaction( 
					(function (transaction) {
						transaction.executeSql('UPDATE "trackables" SET "favourite"=? WHERE "tbcode"=?;', [favourite, this.params['tbcode']]);
					}).bind(this)
				);
			break;
			case 'goback':
				this.controller.stageController.popScene();
			break;
			default:
			break;
		}
	}
}

TrackableAssistant.prototype.trackableOwnerClickHandle = function(event) {
	this.controller.popupSubmenu({
		'onChoose': function(command) {
			switch(command) {
				case 'found':
					this.controller.stageController.pushScene('list', 'username', {
						'username': trackable[this.params['tbcode']].owner,
						'tx': cacheIDs['all']
					});
					break;
				case 'owner':
					this.controller.stageController.pushScene('list', 'owner', {
						'username': trackable[this.params['tbcode']].owner,
						'tx': cacheIDs['all']
					});
					break
			}
		}.bind(this),
		'placeNear': event.target,
		'items': [
			{'label': $L('Hidden by this user'), 'command': 'owner'},
			{'label': $L('Found by this user'), 'command': 'found'}
		]
	});
};

TrackableAssistant.prototype.trackableLocationClickHandle = function(event) {
	switch (trackable[this.params['tbcode']].locationType) {
		case 'user':
			this.controller.popupSubmenu({
				'onChoose': function(command) {
					switch(command) {
						case 'found':
							this.controller.stageController.pushScene('list', 'username', {
								'username': trackable[this.params['tbcode']].location,
								'tx': cacheIDs['all']
							});
							break;
						case 'owner':
							this.controller.stageController.pushScene('list', 'owner', {
								'username': trackable[this.params['tbcode']].location,
								'tx': cacheIDs['all']
							});
							break
					}
				}.bind(this),
				'placeNear': event.target,
				'items': [
					{'label': $L('Hidden by this user'), 'command': 'owner'},
					{'label': $L('Found by this user'), 'command': 'found'}
				]
			});
		break;
		case 'cache':
			this.controller.stageController.pushScene('cache', trackable[this.params['tbcode']].locationGuid);
		break;
	}
};

TrackableAssistant.prototype.reloadTrackable = function() {
	if(this.params['tbcode']) {
		this.controller.get('trackable-title').update(this.params['tbcode']);
	}

	this.controller.get('trackable-detail').hide();
	this.controller.get('loading-spinner').show();
	
	var item;

	Geocaching.accounts['geocaching.com'].loadTrackable(this.params,
		function(tbcode) {
			this.params['tbcode'] = tbcode;
			
			var ts = Math.round(new Date().getTime() / 1000);
			trackable[this.params['tbcode']].updated = ts;
			var query = 'INSERT INTO "trackables"("tbcode", "guid", "id", "updated", "json") VALUES ("'+
				escape(this.params['tbcode']) + '", "' + 
				escape(trackable[this.params['tbcode']].guid) + '", "' + 
				escape(trackable[this.params['tbcode']].travelid) + '", ' + 
				escape(ts) + ', "' +
				escape(Object.toJSON(trackable[this.params['tbcode']])) +'"); GO;';

			Geocaching.db.transaction( 
				(function (transaction) { 
					transaction.executeSql(query, [], 
						function() {},
						function(transaction, error) {
							if(error['code'] == 1) {
								transaction.executeSql('UPDATE "trackables" SET '+
									'"json"="'+ escape(Object.toJSON(trackable[this.params['tbcode']])) +'", '+
									'"updated"="'+ escape(ts) +'", '+
									'"id"="'+ escape(trackable[this.params['tbcode']].travelid) +'" '+
									' WHERE "tbcode"="'+ escape(this.params['tbcode']) +'"; GO; ', []);
							}
						}.bind(this)
					);
				}).bind(this) 
			); 

			this.showTrackableDetail();
		}.bind(this),
		function(message) {
			this.controller.get('loading-spinner').hide();
			this.showPopup(null, $L("Problem"), message, function() { Mojo.Controller.stageController.popScene(); });
			return false;
		}.bind(this)
	);
};

TrackableAssistant.prototype.openMap = function(event) {
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
		'method': "open",
		'parameters': {
			'id': 'com.palm.app.browser',
			'params': {
				'target': "http://www.geocaching.com/track/map_gm.aspx?ID="+ trackable[this.params['tbcode']].travelid
			}
		}
	});
};

