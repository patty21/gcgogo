function CacheAssistant(gccode) {
	if(gccode.indexOf('GC') === 0) {
		this.geocode = gccode;
		this.guid = false;
	} else {
		this.geocode = false;
		this.guid = gccode;
	}
}

CacheAssistant.prototype.setup = function() {
	//this.controller.stageController.setWindowOrientation('free');
	if (this.geocode) {
		this.controller.get('cache-title').update(this.geocode);
	}
	this.controller.get('loading-spinner').show();
	/* setup widgets here */

	/* add event handlers to listen to events from widgets */
	this.cacheEncodeDecode = this.cacheEncodeDecode.bind(this);
	this.controller.listen("cache-hint-row", Mojo.Event.tap, this.cacheEncodeDecode);

	this.cacheOwnerClickHandle = this.cacheOwnerClickHandle.bind(this);
	this.controller.listen("cache-owner-row", Mojo.Event.tap, this.cacheOwnerClickHandle);

	this.cacheCompass = this.cacheCompass.bind(this);
	this.controller.listen("cache-location-row", Mojo.Event.tap, this.cacheCompass);

	this.cacheSpoilerImages = this.cacheSpoilerImages.bind(this);
	this.controller.listen("cache-spoilerimages-row", Mojo.Event.tap, this.cacheSpoilerImages);

	this.cacheGalleryImages = this.cacheGalleryImages.bind(this);
	this.controller.listen("cache-galleryimages-row", Mojo.Event.tap, this.cacheGalleryImages);
	
	this.cacheDescription = this.cacheDescription.bind(this);
	this.controller.listen("cache-description-row", Mojo.Event.tap, this.cacheDescription);

	this.cacheWaypoints = this.cacheWaypoints.bind(this);
	this.controller.listen("cache-waypoints-row", Mojo.Event.tap, this.cacheWaypoints);

	this.cacheTrackables = this.cacheTrackables.bind(this);
	this.controller.listen("cache-trackables-row", Mojo.Event.tap, this.cacheTrackables);

	this.cacheLogs = this.cacheLogs.bind(this);
	this.controller.listen("cache-logs-row", Mojo.Event.tap, this.cacheLogs);

	this.cacheAttributes = this.cacheAttributes.bind(this);
	this.controller.listen("cache-attributes-row", Mojo.Event.tap, this.cacheAttributes);
	
	this.controller.setupWidget('loading-spinner',
		this.spinnerLAttrs = {
			'spinnerSize': 'large'
		},
		this.spinnerModel = {
			'spinning': true
		}
	);

	if(this.geocode !== false) {
		if (Geocaching.db != null) {
			var item = [];
			Geocaching.db.transaction( 
				(function (transaction) {
					transaction.executeSql('select * from "caches" where "gccode"= ?;', [this.geocode],
						function(transaction, results) {
							try {
								var caches = results.rows.length;
								if(caches == 0) throw("Not in database");
								delete(caches);

								item = results.rows.item(0);

								cache[this.geocode] = unescape(item['json']).evalJSON();

								try {
									cache[this.geocode].userdata = unescape(item['userdata']).evalJSON();
								} catch(e) {
									cache[this.geocode].userdata = {};
								}
								
								try {
									if(item['found'] == 1)
										cache[this.geocode].found = true;
								} catch(e) {}

								try {
									if(item['favourite'] == 1)
										cache[this.geocode].favourite = true;
								} catch(e) {}
								try {
									cache[this.geocode].logs = unescape(item['logs']).evalJSON();
								} catch(e) {
									cache[this.geocode].logs = {};
								}

								cache[this.geocode].updated = item['updated'];

								if(typeof(cache[this.geocode].guid) == 'undefined')
									throw("loadit")

								this.showCacheDetail(this.geocode);
							} catch(e) {
								Mojo.Log.error(Object.toJSON(e));
								this.reloadCache();
							}
						}.bind(this)
					); 
				}).bind(this) 
			);
		} else {
			Geocaching.accounts['geocaching.com'].loadCache({
					'geocode': this.geocode
				},
				this.showCacheDetail.bind(this),
				function(message) {
					delete(cache[this.geocode]);
					this.controller.get('loading-spinner').hide();
					this.showPopup(null, $L("Problem"), message, function() { Mojo.Controller.stageController.popScene(); });
					return false;
				}.bind(this)
			);
		}
	} else {
		Mojo.Log.info('Loading by guid: '+this.guid);
		//  Load cache by guid
		if (Geocaching.db != null) {
			var item = [];
			Geocaching.db.transaction( 
				(function (transaction) {
					transaction.executeSql('select * from "caches" where "guid"= ?;', [this.guid],
						function(transaction, results) {
							try {
								var caches = results.rows.length;
								if(caches == 0) throw("Not in database");
								delete(caches);

								item = results.rows.item(0);

								this.geocode = item['gccode'];
								cache[this.geocode] = unescape(item['json']).evalJSON();

								try {
									cache[this.geocode].userdata = unescape(item['userdata']).evalJSON();
								} catch(e) {
									cache[this.geocode].userdata = {};
								}

								try {
									if(item['found'] == 1)
										cache[this.geocode].found = true;
								} catch(e) {}

								try {
									if(item['favourite'] == 1)
										cache[this.geocode].favourite = true;
								} catch(e) {}
								
								try {
									cache[this.geocode].logs = unescape(item['logs']).evalJSON();
								} catch(e) {
									cache[this.geocode].logs = {};
								}


								cache[this.geocode].updated = item['updated'];

								if(typeof(cache[this.geocode].guid) == 'undefined')
									throw("loadit")

								this.showCacheDetail(this.geocode);
							} catch(e) {
								Mojo.Log.error(Object.toJSON(e));
								this.reloadCache();
							}
						}.bind(this)
					); 
				}).bind(this) 
			);
		} else {
			Geocaching.accounts['geocaching.com'].loadCache({
					'guid': this.guid
				},
				this.showCacheDetail.bind(this),
				function(message) {
					delete(cache[this.geocode]);
					this.controller.get('loading-spinner').hide();
					this.showPopup(null, $L("Problem"), message, function() { Mojo.Controller.stageController.popScene(); });
					return false;
				}.bind(this)
			);
		}
		/* End of GUID loading */
	}

	/* Main Menu */
	this.appMenuModel = {
		'visible': true,
		'items': [
			Mojo.Menu.editItem,
			{'label': $L("Reload cache"), 'command': 'reloadcache' },
			{'label': $L("Find nearby caches"), 'command': 'findnearby' },
			{'label': $L("Find nearby caches of this type"), 'command': 'findnearbytype' },
			{'label': $L("Open cache website"), 'command': 'web' }
		]
	};
	this.controller.setupWidget(Mojo.Menu.appMenu, {'omitDefaultItems': true}, this.appMenuModel);
	/* Command menu */
	this.commandMenuItem2 = {'label': 'Favourite', 'icon': 'make-vip', 'toggleCmd': 'nofavorite', 'items' :[
		{'label': 'Favourite', 'icon': 'make-vip', 'command': 'favourite'}
	]};
	this.commandMenuItem3 = {'label': $L("Post log"), 'icon': 'send', 'command': 'log'} // Preparation for post log
	
	if( gcGogo.isTouchpad() ){
		this.commandMenuItem1 = {items: [
					{'label': $L("Back"), 'icon': 'back', 'command': 'goback'},
					{'label': $L("More info"), 'icon': 'info', 'command': 'info'},
					{'label': $L("Compass"), 'iconPath': defaultnavigationIcons['mappingtool'], 'command': 'mappingtool'}
				]};
	} else {
		this.commandMenuItem1 = {items: [
					{'label': $L("More info"), 'icon': 'info', 'command': 'info'},
	//				{'label':'Users note', 'icon':'attach', 'command':'note', 'disabled': true},
					{'label': $L("Compass"), 'iconPath': defaultnavigationIcons['builtin'], 'command': 'compassbuiltin'},
					{'label': $L("Compass"), 'iconPath': defaultnavigationIcons['mappingtool'], 'command': 'mappingtool'}
				]};
	}
		
	this.commandMenuModel = {
			'items':	[
			this.commandMenuItem1,
			this.commandMenuItem2,
			this.commandMenuItem3
		],
		'visible': false
	}
	this.controller.setupWidget(Mojo.Menu.commandMenu, {'menuClass': 'no-fade'},
		this.commandMenuModel
	);
}

CacheAssistant.prototype.activate = function(event) {
	if(event == 'posted') {
		this.reloadCache();
	}
	var wpCount = 0;
	if( cache[this.geocode] ){
		var wpCount = cache[this.geocode].waypoints.length;
	}
	try {
		wpCount += cache[this.geocode].userdata['waypoints'].length;
	} catch(e) {}
	if(wpCount > 1) {
		this.controller.get('cache-waypoints').update($L("#{num} waypoints").interpolate({'num': wpCount}) +' ');
	} else
	if(wpCount == 1) {
		this.controller.get('cache-waypoints').update($L("1 waypoint"));
	} else {
		this.controller.get('cache-waypoints').update($L("No waypoints"));
	}
}

CacheAssistant.prototype.deactivate = function(event) {
}

CacheAssistant.prototype.cleanup = function(event) {
	delete(cache[this.geocode]);
	Mojo.Event.stopListening(this.controller.get("cache-hint-row"), Mojo.Event.tap, this.cacheEncodeDecode);
	Mojo.Event.stopListening(this.controller.get("cache-owner-row"), Mojo.Event.tap, this.cacheOwnerClickHandle);
	Mojo.Event.stopListening(this.controller.get("cache-location-row"), Mojo.Event.tap, this.cacheCompass);
	Mojo.Event.stopListening(this.controller.get("cache-spoilerimages-row"), Mojo.Event.tap, this.cacheSpoilerImages);
	Mojo.Event.stopListening(this.controller.get("cache-galleryimages-row"), Mojo.Event.tap, this.cacheGalleryImages);
	Mojo.Event.stopListening(this.controller.get("cache-description-row"), Mojo.Event.tap, this.cacheDescription);
	Mojo.Event.stopListening(this.controller.get("cache-waypoints-row"), Mojo.Event.tap, this.cacheWaypoints);
	Mojo.Event.stopListening(this.controller.get("cache-trackables-row"), Mojo.Event.tap, this.cacheTrackables);
	Mojo.Event.stopListening(this.controller.get("cache-logs-row"), Mojo.Event.tap, this.cacheLogs);
	Mojo.Event.stopListening(this.controller.get("cache-attributes-row"), Mojo.Event.tap, this.cacheAttributes);
}

CacheAssistant.prototype.showCacheDetail = function(geocode) {
	this.geocode = geocode;
	Geocaching.gcids[geocode]=1;
	
	if (this.geocode) {
		this.controller.get('cache-title').update(this.geocode);
	}
	var cachetype=cacheTypes[cache[this.geocode].type];
	if (cache[this.geocode].latlonorg!="" && cachetype=="mystery") cachetype+="-solved";
	this.controller.get('cache-icon').innerHTML = '<img class="gc-icon" src="images/'+ cachetype +'.gif" /> ';
	this.controller.get('cache-icon').className = 'icon img';
	this.controller.get('cache-name').update(cache[this.geocode].name);
	if(cache[this.geocode].found) {
		this.controller.get('cache-title').innerHTML += ' <img src="images/found.png" />';
	}
	if(cache[this.geocode].own) {
		this.controller.get('cache-title').innerHTML += ' <img src="images/star.png" />';
	}
	if(cache[this.geocode].members) {
		this.controller.get('cache-title').innerHTML += ' <img src="images/members_small.gif" />';
	}
	if(cache[this.geocode].needsmaint) {
		this.controller.get('cache-title').innerHTML += ' <img src="images/needsmaint.gif" />';
	}

	if(cache[this.geocode].archived) {
		this.controller.get('cache-title').className += ' gc-archived';
		this.controller.get('cache-name').className += ' gc-archived';
		this.controller.get('cache-availability').update($L("Archived"));

	} else
	if(cache[this.geocode].disabled) {
		this.controller.get('cache-title').className += ' gc-disabled';
		this.controller.get('cache-name').className += ' gc-disabled';
		this.controller.get('cache-availability').update($L("Temporarily unavailable"));
	} else
	if(cache[this.geocode].members) {
		this.controller.get('cache-availability').update($L("For members only"));
	} else
	if(cache[this.geocode].needsmaint) {
		this.controller.get('cache-availability').update($L("Needs maintenance"));
	} else {
		this.controller.get('cache-availability').update($L("Available"));
	}

	try {
		if(cache[this.geocode].updated) {
			var updatedDate = new Date();
			updatedDate.setTime(cache[this.geocode].updated *1000);
			this.controller.get('cache-updated').update(Mojo.Format.formatDate(updatedDate, 'medium'));

			var tsExpired = Math.round(new Date().getTime() / 1000)-(5*24*60*60);
			var tsOutdated = Math.round(new Date().getTime() / 1000)-(2*24*60*60);
			
			// Cache is outdated after 5 days
			if(cache[this.geocode].updated < tsOutdated) {
				Mojo.Controller.getAppController().showBanner({'messageText': $L("Some data can be outdated.")}, '', 'cache');
			}
			if(cache[this.geocode].updated < tsExpired) {
				this.controller.get('cache-title').innerHTML += ' <img src="images/outdated.png" />';
			}
		}
	} catch(e) { }
	var tmp="";
	if (cache[this.geocode].latlonorg!="") tmp=$L('Corrected from ')+cache[this.geocode].latlonorg+'<br>';
	this.controller.get('cache-type').update(cache[this.geocode].type);
	this.controller.get('cache-owner').update(cache[this.geocode].owner);
	this.controller.get('cache-hint').update(cache[this.geocode].hint);
	this.controller.get('cache-size').src='images/'+ (cacheSizeImages[cache[this.geocode].size]?cacheSizeImages[cache[this.geocode].size]:'other') + '.gif';
	this.controller.get('cache-size-label').update($L(cacheSizeNames[cache[this.geocode].size]));
	this.controller.get('cache-terrain').src='images/stars'+ cache[this.geocode].terrain.replace('.', '_') + '.gif';
	this.controller.get('cache-terrain-label').update(cache[this.geocode].terrain);
	this.controller.get('cache-difficulty').src='images/stars'+ cache[this.geocode].difficulty.replace('.', '_') + '.gif';
	this.controller.get('cache-difficulty-label').update(cache[this.geocode].difficulty);
	this.controller.get('cache-latlon').update(Geocaching.toLatLon(cache[this.geocode].latitude,"lat")+"<br>"+Geocaching.toLatLon(cache[this.geocode].longitude,"lon"));
	this.controller.get('cache-location').update(tmp+cache[this.geocode].location);
	this.controller.get('cache-description').update(cache[this.geocode].shortdesc != "" ? cache[this.geocode].shortdesc : $L("Tap for full listing"));
	if (cache[this.geocode].note!="") {
		this.controller.get('cache-note').update(cache[this.geocode].note);
		this.controller.get('cache-note-row').show();
	}
	try {
		if (typeof(cache[this.geocode].userdata['gcvote'])!=undefined && cache[this.geocode].userdata['gcvote'].cnt>0) {
			this.showVote(cache[this.geocode].userdata['gcvote']);
			
		}
	} catch (e) {}
	if (Geocaching.settings['gcvote']) {
		this.controller.get('label-size').update("size<br>difficulty<br>terrain<br>quality");
		this.controller.get('row-quality').show();
	}
	
	// Get my position to show map
	this.controller.serviceRequest('palm://com.palm.location', {
		'method': 'getCurrentPosition',
		'parameters': {
			'accuracy': 1,
			'responseTime': 1,
			'maximumAge': 60,
		},
		'onSuccess': this.actionMyPositionSuccess.bind(this),
		'onFailure': this.actionMyPositionSuccess.bind(this)
	});
	
	// Event date
	if(cache[this.geocode].date) {
		this.controller.get('cache-date').update(cache[this.geocode].date);
		this.controller.get('cache-date-row').show();
	}
	
	var siCount = cache[this.geocode].spoilerImages.length;
	if(siCount > 1) {
		this.controller.get('cache-spoilerimages').update($L("#{num} images").interpolate({'num': siCount}));
	} else
	if(siCount == 1) {
		this.controller.get('cache-spoilerimages').update($L("1 image"));
	} else {
		this.controller.get('cache-spoilerimages').update($L("No images"));
	}
	delete(siCount);

	if(cache[geocode].galleryImagesCount > 1) {
		this.controller.get('cache-galleryimages').update($L("#{num} images").interpolate({'num': cache[geocode].galleryImagesCount}));
	} else
	if(cache[geocode].galleryImagesCount == 1) {
		this.controller.get('cache-galleryimages').update($L("1 image"));
	} else {
		this.controller.get('cache-galleryimages').update($L("No images"));
	}
	
	var wpCount = cache[this.geocode].waypoints.length;
	try {
		wpCount += cache[this.geocode].userdata['waypoints'].length;
	} catch(e) {}
	if(wpCount > 1) {
		this.controller.get('cache-waypoints').update($L("#{num} waypoints").interpolate({'num': wpCount}) +' ');
	} else
	if(wpCount == 1) {
		this.controller.get('cache-waypoints').update($L("1 waypoint"));
	} else {
		this.controller.get('cache-waypoints').update($L("No waypoints"));
	}
	delete(wpCount);

	var trkCount = cache[this.geocode].trackables.length;
	if(trkCount > 1) {
		this.controller.get('cache-trackables').update($L("#{num} trackables").interpolate({'num': trkCount}) +' ');
	} else
	if(trkCount == 1) {
		this.controller.get('cache-trackables').update($L("1 trackable"));
	} else {
		this.controller.get('cache-trackables').update($L("No trackable"));
	}
	delete(trkCount);
	var ctype=cacheTypesIDs[cache[this.geocode].type];
	if (ctype==6 || ctype==13 || ctype==453)
		this.controller.get('cache-logs').update('<img src="images/log_attended.gif"> '+cache[this.geocode].finds+
				' &nbsp;&nbsp;&nbsp; <img src="images/log_willattend.gif"> '+cache[this.geocode].dnfs+
				' &nbsp;&nbsp;&nbsp; <img src="images/favorites.png"> '+cache[this.geocode].favs);
	else 
		this.controller.get('cache-logs').update('<img src="images/log_found.gif"> '+cache[this.geocode].finds+
				' &nbsp;&nbsp;&nbsp; <img src="images/log_notfound.gif"> '+cache[this.geocode].dnfs+
				' &nbsp;&nbsp;&nbsp; <img src="images/favorites.png"> '+cache[this.geocode].favs);
	var atCount = cache[this.geocode].attrs.length;
	var attrs = new Array();
	if(atCount) {
		for(var i=0; i<atCount; i++) {
			attrs.push('<img src="images/attributes/'+ cache[this.geocode].attrs[i]['img'] +'.gif" />');
		}
		this.controller.get('cache-attributes').update(attrs.join(' '));
	} else {
		this.controller.get('cache-attributes').update($L("No attributes"));
	}
	
	if(cache[this.geocode].favourite) {

		this.commandMenuItem2 = {'label': 'Favourite', 'icon': 'make-vip', 'toggleCmd': 'favourite', 'items': [
			{'label': 'Favourite', 'icon': 'make-vip', 'command': 'favourite'}
		]};
		this.commandMenuModel['items'] = [
			this.commandMenuItem1,
			this.commandMenuItem2,
			this.commandMenuItem3
		];
		this.controller.modelChanged(this.commandMenuModel);
	}

	this.controller.get('loading-spinner').hide();
	this.controller.get('cache-detail').show();

	// Show command menu
	this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
	
	
}

CacheAssistant.prototype.showVote = function(vote) {
	var votep=vote.cnt!=1?"s":"";
	this.controller.get('cache-quality-label').update((Math.round(vote.avg*10)/10)+" ("+vote.cnt+" vote"+votep+")");
	this.controller.get('cache-quality').src='images/stars'+ (Math.round(vote.avg*2)/2).toString().replace('.', '_') + '.gif';
}



CacheAssistant.prototype.updateVote = function(vote) {
	if (vote.cnt) {
		this.showVote(vote);
		cache[this.geocode].userdata['gcvote']=vote;
		Geocaching.db.transaction((function (transaction) { 
			transaction.executeSql('UPDATE "caches" SET "userdata"=? WHERE "gccode"= ?', [Object.toJSON(cache[this.geocode].userdata), this.geocode],
				function() {},function() {});
		}).bind(this));
	}
}



CacheAssistant.prototype.showPopup = function(event, title, message, onChoose) {
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

CacheAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.command) {
		switch(event.command) {
			case 'info':
				if(this.controller.get('cache-detail').className.indexOf('gc-basic') != -1) {
					this.controller.get('cache-detail').className = this.controller.get('cache-detail').className.replace(/gc-basic/g, '');
				} else {
					this.controller.get('cache-detail').className += ' gc-basic';
				}
			break;
			case 'logs':
				this.controller.stageController.pushScene('cachelogs', this.geocode);
			break;
			case 'log':
				if (Geocaching.settings['fieldnotes']) {
					this.controller.popupSubmenu({
						'onChoose': function(choice) {
							switch(choice) {
								case 'postlog':
									this.controller.stageController.pushScene('postlog', this.geocode);
									break;
							}
						}.bind(this),
						'placeNear': event.originalEvent.target,
						'items': [
							{'label': $L("Post log"), 'command': 'postlog'},
							{'label': $L("Fieldnote"),'disabled':true, 'command': 'fieldnote'}
						]
					});
				} else {
					this.controller.stageController.pushScene('postlog', this.geocode);
				}
			break;
			case 'findnearby':
				if(cache[this.geocode].latitude != 0 && cache[this.geocode].longitude != 0) {
					this.controller.stageController.pushScene('list', 'coords', {
						'lat': cache[this.geocode].latitude,
						'lon': cache[this.geocode].longitude,
						'tx': cacheIDs['all']
					});
				}
			break;
			case 'findnearbytype':
				if(cache[this.geocode].latitude != 0 && cache[this.geocode].longitude != 0) {
					this.controller.stageController.pushScene('list', 'coords', {
						'lat': cache[this.geocode].latitude,
						'lon': cache[this.geocode].longitude,
						'tx': cacheIDs[cacheTypes[cache[this.geocode].type]]
					});
				}
			break;			
			case 'web':
				this.controller.serviceRequest("palm://com.palm.applicationManager", {
					'method': "open",
					'parameters': {
					    'id': 'com.palm.app.browser',
					    'params': {
						'target': "http://www.geocaching.com/seek/cache_details.aspx?wp="+ this.geocode
					    }
					}
				});
			break;
			case 'reloadcache':
				this.reloadCache();
			break;
			case 'compass':
				this.cacheCompass(event);
			break;
			case 'compassbuiltin':
				this.cacheCompass(1);
			break;
			case 'mappingtool':
				this.cacheCompass(2);
			break;
			case 'favourite':
				var favourite;
				if(cache[this.geocode].favourite) {
					favourite = 0;
					cache[this.geocode].favourite = false;
				} else {
					favourite = 1;
					cache[this.geocode].favourite = true;
				}

				Geocaching.db.transaction( 
					(function (transaction) {
						transaction.executeSql('UPDATE "caches" SET "favourite"='+ favourite +' WHERE "gccode"="'+ escape(this.geocode) +'";', []);
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

CacheAssistant.prototype.cacheEncodeDecode = function(event) {
	this.controller.get('cache-hint').innerHTML = Geocaching.decodeText(this.controller.get('cache-hint').innerHTML.replace("<br>", "\n")).replace("\n", "<br>");
}

CacheAssistant.prototype.cacheOwnerClickHandle = function(event) {
	this.controller.popupSubmenu({
		'onChoose': function(command) {
			switch(command) {
				case 'found':
					this.controller.stageController.pushScene('list', 'username', {
						'username': cache[this.geocode].owner,
						'tx': cacheIDs['all']
					});
					break;
				case 'owner':
					this.controller.stageController.pushScene('list', 'owner', {
						'username': cache[this.geocode].owner,
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
}

CacheAssistant.prototype.cacheDescription = function(event) {
	this.controller.stageController.pushScene('description', this.geocode);
}

CacheAssistant.prototype.cacheLogs = function(event) {
	this.controller.stageController.pushScene('cachelogs', this.geocode);
}


CacheAssistant.prototype.cacheSpoilerImages = function(event) {
	if(cache[this.geocode].spoilerImages.length > 0) {
		this.controller.stageController.pushScene('spoilerimages', this.geocode);
	}
}

CacheAssistant.prototype.cacheGalleryImages = function(event) {
	if(cache[this.geocode].galleryImagesCount > 0) {
		this.controller.stageController.pushScene('galleryimages', this.geocode);
	}
}

CacheAssistant.prototype.cacheCompass = function(event) {
	var waypoints = [];
	waypoints.push({
		'title': this.geocode,
		'latitude': cache[this.geocode].latitude,
		'longitude': cache[this.geocode].longitude,
		'wptType': 'cache',
		'type': cache[this.geocode].type
	});
	
	if(cache[this.geocode].waypoints.length > 0) {
		for(var z in cache[this.geocode].waypoints) {
			var wp = cache[this.geocode].waypoints[z];
			if(typeof(wp['latitude'])!='undefined' && typeof(wp['longitude'])!='undefined') {
				waypoints.push({
					'title': $L("Waypoint #{name}").interpolate({'name': wp['name']}),
					'latitude': wp['latitude'],
					'longitude': wp['longitude'],
					'wptType': 'waypoint',
					'type': wp['type']
				});
			}
		}
	}

	// Add user waypoints
	try {
		var userWpts = cache[this.geocode].userdata['waypoints'];
		var userWptsLen = userWpts.length;
		if(userWptsLen > 0) {
			for(z=0; z<userWptsLen; z++) {
				var wp = cache[this.geocode].userdata['waypoints'][z];
				if(typeof(wp['latitude'])!='undefined' && typeof(wp['longitude'])!='undefined') {
					waypoints.push({
						'title': $L("Waypoint #{name}").interpolate({'name': wp['name']}),
						'latitude': wp['latitude'],
						'longitude': wp['longitude'],
						'wptType': 'waypoint',
						'type': wp['type']
					});
				}
			}
		}
	} catch(e) {
		Mojo.Log.error(Object.toJSON(e));
	}

	if((event!=1 && Geocaching.settings['defaultnavigation'] == 'mappingtool') || event == 2) {
		var params = Geocaching.format4Maptool(waypoints);
		Mojo.Log.error(Object.toJSON(params));
		// Try Map Tool Pro
		this.controller.serviceRequest('palm://com.palm.applicationManager', {
				'method': 'launch',
				'parameters': {
					'id': 'de.metaviewsoft.maptoolpro',
					'params': Object.toJSON(params)
				},
				'onFailure': function(text, value) {
					// Now try Map Tool Free
					this.controller.serviceRequest('palm://com.palm.applicationManager', {
						'method': 'launch',
						'parameters': {
							'id': 'de.metaviewsoft.maptool',
							'params': Object.toJSON(params)
						},
						'onFailure': function(text, value) {
							this.controller.showAlertDialog({
								'onChoose': function(value) {},
								'title': $L("Execution failure"),
								'message': $L({'value': "This feature require external application 'Mapping Tool'. It can be downloaded from App Catalog.", 'key':'mappingtool_failure'}),
								'choices': [{'label': $L("Close"), 'value':'close', 'type':'primary'} ]
							});
						}.bind(this)
					});
				}.bind(this)
			});
		return true;
	}

	if(Geocaching.settings['compassInNewCard']) {
		var geocode = this.geocode;
		var appController = Mojo.Controller.getAppController();
		var f = function(stageController){
			stageController.pushScene(
				{
					'name': 'compass',
					'disableSceneScroller': true
				}, {
					'title': geocode,
					'latitude': cache[geocode].latitude,
					'longitude': cache[geocode].longitude,
					'waypoints': waypoints,
					'geocode': geocode
				}
			);
		};
		appController.createStageWithCallback({
			'name': 'compass'+this.geocode,
			'lightweight': true
		}, f, 'card');
	} else {
		this.controller.stageController.pushScene(
			{
				'name': 'compass',
				'disableSceneScroller': true
			}, {
				'title': this.geocode,
				'latitude': cache[this.geocode].latitude,
				'longitude': cache[this.geocode].longitude,
				'waypoints': waypoints,
				'geocode': this.geocode
			}
		);
	}
}

CacheAssistant.prototype.cacheWaypoints = function(event) {
	this.controller.stageController.pushScene('waypoints', this.geocode);
}

CacheAssistant.prototype.cacheTrackables = function(event) {
	if(cache[this.geocode].trackables.length > 0) {
		this.controller.stageController.pushScene('trackables', 'cache', {'gccode': this.geocode});
	}
}

CacheAssistant.prototype.cacheAttributes = function(event) {
	if(cache[this.geocode].attrs.length > 0) {
		this.controller.stageController.pushScene('attributes', this.geocode);
	}
}

CacheAssistant.prototype.reloadCache = function() {
	if (this.geocode) {
		this.controller.get('cache-title').update(this.geocode);
	}

	this.controller.get('cache-detail').hide();
	this.controller.get('loading-spinner').show();
	
	var item;
	try {
		item = {
			'found': cache[this.geocode].found
		};
	} catch(e) {
		item = {
			'found': false
		};
	}
	try {
		item = {
			'userdata': cache[this.geocode].userdata
		};
	} catch(e) {
		item = {
			'userdata': {}
		};
	}

	if(this.geocode !== false) {
		Geocaching.accounts['geocaching.com'].loadCache({
				'geocode': this.geocode
			},
			function() {
				try {
					if(item['found'] == 1)
						cache[this.geocode].found = true;
				} catch(e) {}
				cache[this.geocode].userdata = item['userdata'];

				var ts = Math.round(new Date().getTime() / 1000);
				cache[this.geocode].updated = ts;
				var logs=cache[this.geocode].logs;
				delete(cache[this.geocode].logs);
				this.guid = cache[this.geocode].guid;

				var query = 'INSERT INTO "caches"("gccode", "guid", "updated", "found", "latitude", "longitude", "json", "logs") VALUES ("'+
					escape(this.geocode) + '", "' + 
					escape(this.guid) + '", ' + 
					escape(ts) + ', ' +
					escape(cache[this.geocode].found?1:0) + ', ' +
					escape(cache[this.geocode].latitude) + ', ' +
					escape(cache[this.geocode].longitude) + ', "' +  
					escape(Object.toJSON(cache[this.geocode])) +'","'+
					escape(Object.toJSON(logs))+ '"); GO;';

				Geocaching.db.transaction( 
					(function (transaction) { 
						transaction.executeSql(query, [], 
							function() {},
							function(transaction, error) {
								if(error['code'] == 1) {
									transaction.executeSql('UPDATE "caches" SET '+
										'"guid"="'+ escape(cache[this.geocode].guid) +'", '+
										'"json"="'+ escape(Object.toJSON(cache[this.geocode])) +'", '+
										'"logs"="'+ escape(Object.toJSON(logs)) +'", '+
										'"updated"="'+ escape(ts) +'", '+
										'"found"="'+ escape(cache[this.geocode].found?1:0) +'", '+
										'"latitude"='+ escape(cache[this.geocode].latitude) +', '+
										'"longitude"='+ escape(cache[this.geocode].longitude) +' '+
										' WHERE "gccode"="'+ escape(this.geocode) +'"; GO; ', []);
								}
							}.bind(this)
						);
					}).bind(this) 
				); 
				cache[this.geocode].logs=logs;
				this.showCacheDetail(this.geocode);
				Geocaching.accounts['gcvote'].getSingleVote(cache[this.geocode].guid,this.updateVote.bind(this));
			}.bind(this),
			this.saveLogs.bind(this),
			function(message) {
				delete(cache[this.geocode]);
				this.controller.get('loading-spinner').hide();
				this.showPopup(null, $L("Problem"), message, function() { Mojo.Controller.stageController.popScene(); });
				return false;
			}.bind(this)
		);
	} else {
		// Load by GUID
		Geocaching.accounts['geocaching.com'].loadCache({
				'guid': this.guid
			},
			function(geocode) {
				this.geocode = geocode;
				try {
					if(item['found'] == 1)
						cache[this.geocode].found = true;
				} catch(e) {}

				var ts = Math.round(new Date().getTime() / 1000);
				cache[this.geocode].updated = ts;
				var logs=cache[this.geocode].logs;
				delete(cache[this.geocode].logs);
				var query = 'INSERT INTO "caches"("gccode", "guid", "updated", "found", "latitude", "longitude", "json", "logs") VALUES ("'+
					escape(this.geocode) + '", "' + 
					escape(this.guid) + '", ' + 
					escape(ts) + ', ' +
					escape(cache[this.geocode].found?1:0) + ', ' +
					escape(cache[this.geocode].latitude) + ', ' +
					escape(cache[this.geocode].longitude) + ', "' +  
					escape(Object.toJSON(cache[this.geocode])) +'","'+
					escape(Object.toJSON(logs))+ '"); GO;';
					
				Geocaching.db.transaction( 
					(function (transaction) { 
						transaction.executeSql(query, [], 
							function() {},
							function(transaction, error) {
								if(error['code'] == 1) {
									transaction.executeSql('UPDATE "caches" SET '+
										'"guid"="'+ escape(cache[this.geocode].guid) +'", '+
										'"json"="'+ escape(Object.toJSON(cache[this.geocode])) +'", '+
										'"logs"="'+ escape(Object.toJSON(logs)) +'", '+
										'"updated"="'+ escape(ts) +'", '+
										'"found"="'+ escape(cache[this.geocode].found?1:0) +'", '+
										'"latitude"='+ escape(cache[this.geocode].latitude) +', '+
										'"longitude"='+ escape(cache[this.geocode].longitude) +' '+
										' WHERE "gccode"="'+ escape(this.geocode) +'"; GO; ', []);
								}
							}.bind(this)
						);
					}).bind(this) 
				); 
				cache[this.geocode].logs=logs;
				this.showCacheDetail(this.geocode);
				Geocaching.accounts['gcvote'].getSingleVote(cache[this.geocode].guid,this.updateVote.bind(this));
			}.bind(this),
			this.saveLogs.bind(this),
			function(message) {
				delete(cache[this.geocode]);
				this.controller.get('loading-spinner').hide();
				this.showPopup(null, $L("Problem"), message, function() { Mojo.Controller.stageController.popScene(); });
				return false;
			}.bind(this)
		);
	}
}


CacheAssistant.prototype.saveLogs = function(geocode) {
	var query = 'UPDATE "caches" set "logs"="'+escape(Object.toJSON(cache[geocode].logs))+'" WHERE "gccode"="'+escape(geocode)+'"; GO;';
	Mojo.Log.info('Save logs:'+geocode+query);
	Geocaching.db.transaction( 
		(function (transaction) { 
			transaction.executeSql(query, [], 
				function() {},
				function() {}
			);
		}).bind(this)
	);
}


CacheAssistant.prototype.actionMyPositionSuccess = function(event) {
	var accuracy = event.horizAccuracy;
	if(!accuracy) {
		this.actionMyPositionFailed(event);
		return false;
	}
	
	var latitude = event.latitude.toFixed(5);
	var longitude = event.longitude.toFixed(5);

	// Share GPS location
	if(Geocaching.settings['go4cache']) {
		Geocaching.accounts['go4cache'].sendLocation(latitude, longitude, this.geocode);
	}
	
	var distance = Geocaching.getDistance(latitude, longitude, cache[this.geocode].latitude, cache[this.geocode].longitude);	
	var markerSize = 'tiny';
	if(distance > 5) {
		markerSize = 'small';
	}
	var target = '';
	var width = 320;
	var height = 120;
	if( gcGogo.isTouchpad() ){
		width = Mojo.Environment.DeviceInfo.screenWidth;
		height = 200;
		this.controller.get('cachemap').addClassName("touchpad");
	}
	var url = 'http://maps.google.com/maps/api/staticmap?size='+width+'x'+height+'&sensor=false&mobile=true&format=jpg';
	
	if(distance < 5) {
		if(cache[this.geocode].waypoints.length > 0) {
			for(var z in cache[this.geocode].waypoints) {
				var wp = cache[this.geocode].waypoints[z];
				if(typeof(wp['latitude'])!='undefined' && typeof(wp['longitude'])!='undefined') {
					target = 'icon:http://www.geocaching.com/images/wpttypes/sm/'+ wp['type'] +'.jpg|'+ wp['latitude'].toFixed(5) +','+ wp['longitude'].toFixed(5)
					url += '&markers='+encodeURIComponent(target);
				}
			}
		}
		try {
			if(typeof(cache[this.geocode].userdata['waypoints']) != 'undefined') {
				var userWpts = cache[this.geocode].userdata['waypoints'];
				var userWptsLen = userWpts.length;
				if(userWptsLen > 0) {
					for(z=0; z<userWptsLen; z++) {
						var wp = cache[this.geocode].userdata['waypoints'][z];
						if(typeof(wp['latitude'])!='undefined' && typeof(wp['longitude'])!='undefined') {
							target = 'icon:http://www.geocaching.com/images/wpttypes/sm/waypoint.jpg|'+ wp['latitude'].toFixed(5) +','+ wp['longitude'].toFixed(5)
							url += '&markers='+encodeURIComponent(target);
						}
					}
				}
			}
		} catch(e) {
			Mojo.Log.error('Exception raised in adding user waypoints to map: %j', e);
		}
	}

	// Finally, add position and target
	url += '&markers='+ encodeURIComponent('color:blue|size:'+ markerSize +'|'+ latitude +','+ longitude) + '&markers='+ encodeURIComponent('icon:http://www.geocaching.com/images/wpttypes/sm/'+ cacheTypesIDs[cache[this.geocode].type] +'.gif|'+ cache[this.geocode].latitude.toFixed(5) +','+ cache[this.geocode].longitude.toFixed(5));

	Mojo.Log.info('Minimap with user position url: %s', url);

	this.controller.get('cachemap').update('<img src="'+ url +'" />');
};

CacheAssistant.prototype.actionMyPositionFailed = function(event) {
	
	// Share GPS location
	if(Geocaching.settings['go4cache']) {
		Geocaching.accounts['go4cache'].sendLocation(cache[this.geocode].latitude, cache[this.geocode].longitude, 'discovering');
	}	
	
	var icon = 'http://www.geocaching.com/images/wpttypes/sm/'+ cacheTypesIDs[cache[this.geocode].type] +'.gif';
	var width = 320;
	var height = 120;
	if( gcGogo.isTouchpad() ){
		width = Mojo.Environment.DeviceInfo.screenWidth;
		height = 200;
		this.controller.get('cachemap').addClassName("touchpad");
	}
	var url = 'http://maps.google.com/maps/api/staticmap?size='+width+'x'+height+'&sensor=false&mobile=true&format=png';
	
	if(cache[this.geocode].waypoints.length > 0) {
		for(var z in cache[this.geocode].waypoints) {
			var wp = cache[this.geocode].waypoints[z];
			if(typeof(wp['latitude'])!='undefined' && typeof(wp['longitude'])!='undefined') {
				target = 'icon:http://www.geocaching.com/images/wpttypes/sm/'+ wp['type'] +'.jpg|'+ wp['latitude'].toFixed(5) +','+ wp['longitude'].toFixed(5)
				url += '&markers='+encodeURIComponent(target);
			}
		}
	}
	try {
		if(typeof(cache[this.geocode].userdata['waypoints']) != 'undefined') {
			var userWpts = cache[this.geocode].userdata['waypoints'];
			var userWptsLen = userWpts.length;
			if(userWptsLen > 0) {
				for(z=0; z<userWptsLen; z++) {
					var wp = cache[this.geocode].userdata['waypoints'][z];
					if(typeof(wp['latitude'])!='undefined' && typeof(wp['longitude'])!='undefined') {
						target = 'icon:http://www.geocaching.com/images/wpttypes/sm/waypoint.jpg|'+ wp['latitude'].toFixed(5) +','+ wp['longitude'].toFixed(5)
						url += '&markers='+encodeURIComponent(target);
					}
				}
			}
		}
	} catch(e) {
		Mojo.Log.error('Exception raised in adding user waypoints to map: %j', e);
	}	
	
	// Finally, add target
	url += '&markers='+ encodeURIComponent('icon:'+icon+'|'+cache[this.geocode].latitude.toFixed(5)+','+cache[this.geocode].longitude.toFixed(5));

	Mojo.Log.info('Minimap url: %s', url);
	
	this.controller.get('cachemap').update('<img src="'+ url +'" />');
}
