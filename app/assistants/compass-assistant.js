function CompassAssistant(parameters) {
	this.parameters = parameters;
}

CompassAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */

	this.screenAlwaysOn = undefined;

	this.compassImg = new Image();
	this.compassImg.src = "images/compass_degres.png";

	if(typeof(this.parameters['title']) != 'undefined') {
		this.controller.get('title').update(this.parameters['title']);
	}

	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	this.controller.stageController.setWindowOrientation('up');
	/* setup widgets here */
	this.firstFix = false;
	this.locateMe = false; // Measure user coordinates
	this.locateDB = [];
	this.badFixes = 0;
	this.gpsLastHit = 0;
	this.arrowDirection = 0;
	this.northDirection = 0;
	
	// GPS data
	this.latitude = null;
	this.longitude = null;
	this.accuracy = null;
	this.speed = null;
	this.lastGPSAct = null;
	this.heading = null;
	
	this.commandMenuFix = $L("N/A");
	this.commandMenuDistance = $L("N/A");
	this.commandMenuVelocity = $L("N/A");
	this.commandMenuHeading = $L("N/A");
	this.commandMenuLatitude = $L("N/A");
	this.commandMenuLongitude = $L("N/A");
	this.fix = false;
	this.controller.setupWidget(Mojo.Menu.commandMenu, {'menuClass': 'no-fade'},
		this.commandMenuModel = {
			'items':	[
				{'label': $L({'value': "Waiting for GPS ...", 'key': 'no_fix'}), 'command': 'fix'},
				{'label': this.commandMenuVelocity, 'command': 'velocity'},
				{'label': this.commandMenuDistance, 'command': 'distance'}
			],
			'visible': true
		}
	);

	
	if(typeof(this.parameters['latitude']) != 'undefined' && typeof(this.parameters['longitude']) != 'undefined') {
		this.controller.get('arrow').show();
		this.isTarget = true;
	} else {
		this.isTarget = false;
		this.controller.get('arrow').hide();
	}

	/* Main Menu */
	this.appMenuModel = {
		'visible': true,
		'items': this.generateAppMenu()
	};
	this.controller.setupWidget(Mojo.Menu.appMenu, {'omitDefaultItems': true}, this.appMenuModel);

	/* add event handlers to listen to events from widgets */


	if(!Geocaching.settings['tutorials'].compass) {
		this.showTutorial();
	}

	// this.controller.enableFullScreenMode(true);

	try {
		if(Mojo.Environment.DeviceInfo['screenHeight'] <= 400) {
			this.controller.get('header').hide();
			this.controller.get('header_spacer').show();
		}
	} catch(e) { }
	
	this.compass = this.controller.serviceRequest('palm://com.palm.location', {
		'method': 'startTracking',
		'parameters': {
			'accuracy': 1,
			'maximumAge': 1,
			'responseTime': 1,
			'subscribe': true
		},
		'onSuccess': this.gpsChanged.bind(this),
		'onFailure': this.gpsError.bind(this)
	});
	this.compassRendering = window.setInterval(this.renderCompass.bind(this), 1000);
}

CompassAssistant.prototype.activate = function(event) {
	this.turnScreenON();
}

CompassAssistant.prototype.deactivate = function(event) {
	this.turnScreenOFF();
}

CompassAssistant.prototype.cleanup = function(event) {
	// Disable Screen ON
	this.turnScreenOFF();
	try {
		this.compass.cancel();
	} catch(e) {}
	try {
		clearInterval(this.compassRendering);
	} catch(e) {}
}

CompassAssistant.prototype.turnScreenON = function() {
	try {
		this.controller.stageController.setWindowProperties({'blockScreenTimeout': true});
	} catch(e) {}
}

CompassAssistant.prototype.turnScreenOFF = function() {
	try {
		this.controller.stageController.setWindowProperties({'blockScreenTimeout': false});
	} catch(e) {}
}

CompassAssistant.prototype.refreshContentMenu = function() {
	var compass = this.controller.get('compass');
	if(this.fix) {
		this.commandMenuModel.items = [
			{'label': this.commandMenuFix, 'command': 'fix'},
			{'label': this.commandMenuVelocity, 'command': 'velocity'},
			{'label': this.commandMenuDistance, 'command': 'distance'}
		];
		if(!this.locateMe) {
			this.controller.get('message').hide();
		}
		this.controller.get('message_waiting').hide();
		compass.style['opacity'] = 1;
	} else {
		if(this.firstFix == true) {
			this.commandMenuModel.items = [
				{'label': $L({'value': "Bad GPS signal", 'key': 'bad_fix'}), 'command': 'fix'},
				{'label': this.commandMenuVelocity, 'command': 'velocity'},
				{'label': '~ '+this.commandMenuDistance, 'command': 'distance'}
			];
		} else {
			this.commandMenuModel.items = [
				{'label': $L({'value': "Waiting for GPS ...", 'key': 'no_fix'}), 'command': 'fix'},
				{'label': this.commandMenuVelocity, 'command': 'velocity'},
				{'label': $L("N/A"), 'command': 'distance'}
			];
		}
		this.controller.get('message_waiting').show();
		this.controller.get('message').show();
		compass.style['opacity'] = 0.5;
	}
	this.controller.modelChanged(this.commandMenuModel);
}

CompassAssistant.prototype.gpsChanged = function(event) {
	if(event.errorCode != 0) {
		this.handleGPSError(event);
		return false;
	}
		
	if(event.horizAccuracy) {
		var ts = Math.round(new Date().getTime() / 1000);
		this.latitude = event.latitude;
		this.longitude = event.longitude;
		this.accuracy = event.horizAccuracy;
		this.speed = event.velocity;
		this.lastGPSAct = ts;
		this.heading = event.heading;
	}
}


CompassAssistant.prototype.renderCompass = function() {
	var ts = Math.round(new Date().getTime() / 1000);
	var badFix = true;

	if(this.lastGPSAct > this.gpsLastHit) {
		this.gpsLastHit = this.lastGPSAct;
			
		// Accuracy is too low
		if(this.accuracy <= Geocaching.settings['minimalaccuracy']) {
			badFix = false;
		}

		if(typeof(this.parameters['latitude']) != 'undefined' && typeof(this.parameters['longitude']) != 'undefined') {
			// Share GPS location
			if(Geocaching.settings['go4cache']) {
				Geocaching.accounts['go4cache'].sendLocation(this.latitude, this.longitude, this.parameters['title']);
			}
		}
	}
	
	if(this.accuracy) {
		// Accuracy text is generated all the time
		var accuracyText = Geocaching.getHumanDistance(this.accuracy/1000);
		this.commandMenuFix = '~ '+ accuracyText;
		this.controller.get('message_accuracy').update($L("Accuracy: #{acc}").interpolate({'acc': accuracyText}));
		delete(accuracyText);
	}
		
	if(badFix) {
		this.badFixes++;

		if(this.badFixes == 120) {
			Mojo.Controller.getAppController().showBanner({'messageText': $L({'value':"Your GPS accuracy is still very low. Please move your self to position. where mobile have better view on sattelites.", 'key':'compass_gps_still_bad'})}, '', 'gpsfixed');
		} else
		if(this.badFixes == 240) {
			this.controller.showAlertDialog({
				'onChoose': function(value) {},
				'title': $L("GPS accuracy is very low"),
				'message':$L({'value': "Your GPS accuracy is still very low. Please move your self to position. where mobile have better view on sattelites.", 'key':'compass_gps_still_bad'}),
				'choices': [{'label':$L("Close"), 'value':'close', 'type':'primary'} ]
			});
		} else
		if(this.badFixes > 10) {
			if(this.firstFix == true && this.badFixes == 6) {
				Mojo.Controller.getAppController().showBanner({'messageText': $L({'value': "GPS fix lost.", 'key': 'gps_fix_lost'})}, '', 'gpsfixed');
			}
			this.fix = false;
			this.refreshContentMenu();
		}
		return;
	} else {
		this.badFixes = 0;
		if(this.firstFix == false) {
			Mojo.Controller.getAppController().showBanner({'messageText': $L({'value': "GPS is fixed.", 'key': 'gps_is_fixed'})}, '', 'gpsfixed');
			this.firstFix = true;
		}
		// Signal is good
		this.fix = true;
	}
	
	// Locate Me functions
	if(this.locateMe) {
		this.locateDB.push({
			'lat': this.latitude,
			'lon': this.longitude
		});

		// Calculate average position
		var len = this.locateDB.length;
		var alat=0, alon=0;
		for(var z=0; z<len; z++) {
			alat += this.locateDB[z]['lat'];
			alon += this.locateDB[z]['lon'];
		}

		this.controller.get('message_latlon').update(Geocaching.parseCoordinate(new String(alat/len), 'lat')['string'] +' '+Geocaching.parseCoordinate(new String(alon/len), 'lon')['string'] +' ('+ len +')');
		delete(len); delete(alat); delete(alon);
	}
	
	this.commandMenuLatitude =  Geocaching.parseCoordinate(new String(this.latitude), 'lat')['string'];
	this.commandMenuLongitude =  Geocaching.parseCoordinate(new String(this.longitude), 'lon')['string'];
	this.commandMenuHeading = this.heading + ' °';

	var degrees = 0;

	if(typeof(this.parameters['latitude']) != 'undefined' && typeof(this.parameters['longitude']) != 'undefined') {
		var distance = Geocaching.getDistance(this.latitude, this.longitude, this.parameters['latitude'], this.parameters['longitude']);
		this.commandMenuDistance = Geocaching.getHumanDistance(distance);
		var azimuth = Geocaching.getAzimuth(this.latitude, this.longitude, this.parameters['latitude'], this.parameters['longitude']);
		degrees = Number(azimuth+(360-this.heading));
		while(degrees -180 >= this.arrowDirection) {
			degrees = degrees -360;
		}
		while(degrees +180 < this.arrowDirection) {
			degrees = degrees +360;
		}
		this.controller.get('arrow').style['-webkit-transform'] = 'rotate('+degrees+'deg)';	
		this.arrowDirection = degrees;
	} else {
		this.commandMenuDistance = $L("N/A");
	}

	this.commandMenuVelocity = Geocaching.getHumanSpeed(this.speed);

	degrees = Number(360-this.heading);
	while(degrees -180 >= this.northDirection) {
		degrees = degrees -360;
	}
	while(degrees +180 < this.northDirection) {
		degrees = degrees +360;
	}
	this.controller.get('northpole').style['-webkit-transform'] = 'rotate('+degrees+'deg)';
	this.northDirection = degrees;
	this.controller.commitChanges();
	this.refreshContentMenu();
}

CompassAssistant.prototype.gpsError = function(event) {
	if(event.errorCode != 0) {
		this.handleGPSError(event);
	}
}

CompassAssistant.prototype.handleGPSError = function(event) {

	var message = '', errorType = 'critical';
	switch(event.errorCode) {
		case 4:
			message = $L({'value': "GPS is disabled.", 'key': 'gps_error_disabled'});
			break;
		case 5:
			message = $L({'value': "Location service is off.", 'key': 'gps_error_off'});
			break;
		case 6:
			message = $L({'value': "You must accept the Terms of use for Locaton Services.", 'key': 'gps_error_accept'});
			break;
		case 8:
			message = $L({'value': "This application is blacklisted.", 'key': 'gps_error_blacklist'});
			break;
		default:
			errorType = 'warning';
			break;
	}

	if(errorType == 'critical' && message != '') {
		this.controller.showAlertDialog({
			'onChoose': function() {
				Mojo.Controller.stageController.popScene();
			},
			'title': $L({'value': "GPS Error", 'key':'gps_error'}),
			'message': message,
			'choices': [{'label':$L("Close"), 'value':'Close', 'type':'negative'}]
		});
	} else
	if(message != '') {
		Mojo.Controller.getAppController().showBanner({'messageText': message}, '', 'gpserror');
	}
}

CompassAssistant.prototype.generateAppMenu = function() {
	return [
			Mojo.Menu.editItem,
			{ 'label': $L({'value': "Show target in Google Maps", 'key': 'show_target_in_google_maps'}), 'command': 'googlemaps', 'disabled': !this.isTarget },
			{ 'label': $L({'value': "Show targets in Mapping Tool", 'key': 'show_targets_in_mapping_tool'}), 'command': 'mappingtool', 'disabled': !this.isTarget },
			{ 'label': $L({'value': "Define coordinates", 'key': 'define_coordinates'}), 'command': 'usercoords' },
			{ 'label': (this.locateMe ? $L({'value': "Save my position", 'key': 'locate_me_stop'}) : $L({'value': "Locate me", 'key': 'locate_me'})), 'command': 'locateme' },
			{ 'label': $L({'value': "Save current waypoint", 'key': 'save_waypoint'}), 'command': 'savewaypoint'},
			{ 'label': $L("Help"), 'command': 'tutorial' },
		];
}

CompassAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.command) {
		switch(event.command)
		{
			case 'fix':
				this.controller.popupSubmenu({
					'onChoose': function() {},
					'placeNear': event.originalEvent.target,
					'items': [
						{'label': $L({'value': "GPS data", 'key':'gps_data'}) },
						{'label': $L("Lat") +": "+ this.commandMenuLatitude, 'command': 'none'},
						{'label': $L("Lon") +": "+ this.commandMenuLongitude, 'command': 'none'},
						{'label': $L("Accuracy: #{acc}").interpolate({'acc': this.commandMenuFix}), 'command': 'none'}
					]
				});
			break;
			case 'distance':
				try {
					var wpts = this.parameters.waypoints;
					var wptsLen = wpts.length
					var items = [];
					if(wptsLen > 0) {
						try {
							items.push({'label': $L({'value': "Heading to", 'key': 'heading_to'}) });
							items.push({'label': $L("Lat") +": "+ Geocaching.parseCoordinate(new String(this.parameters['latitude']), 'lat')['string'], disabled: true, 'command': 'none'});
							items.push({'label': $L("Lon") +": "+ Geocaching.parseCoordinate(new String(this.parameters['longitude']), 'lon')['string'], disabled: true, 'command': 'none'});
							items.push({'label': $L("Waypoints")});
						} catch(e) {
							items = [];
							items.push({'label': $L({'value': "No destination set", 'key': 'no_destination_set'}) });
							items.push({'label': $L({'value': "Define coordinates", 'key': 'define_coordinates'}), 'command': 'usercoords'});
							items.push({'label': (this.locateMe ? $L({'value': "Save my position", 'key': 'locate_me_stop'}) : $L({'value': "Locate me", 'key': 'locate_me'})), 'command': 'locateme'});
						}
						for(var z=0; z<wptsLen; z++) {
							items.push({'label': wpts[z]['title'], 'command': z});
						}
						this.controller.popupSubmenu({
							'onChoose': function(wpt) {
								if(typeof(this.parameters.waypoints[wpt])=='object') {
									this.parameters['title'] = this.parameters.waypoints[wpt]['title'];
									this.parameters['latitude'] = this.parameters.waypoints[wpt]['latitude'];
									this.parameters['longitude'] = this.parameters.waypoints[wpt]['longitude'];
									this.controller.get('title').update(this.parameters['title']);
								}
							}.bind(this),
							'placeNear': event.originalEvent.target,
							'items': items
						});
					} else {
						items.push({'label': $L({'value': "No destination set", 'key': 'no_destination_set'})} );
						items.push({'label': $L({'value': "Define coordinates", 'key': 'define_coordinates'}), 'command': 'usercoords'});
						items.push({'label': (this.locateMe ? $L({'value': "Save my position", 'key': 'locate_me_stop'}) : $L({'value': "Locate me", 'key': 'locate_me'})), 'command': 'locateme'});

						this.controller.popupSubmenu({
							'onChoose': function(command) {
								switch(command)
								{
									case 'usercoords':
										this.defineUserCoords();
									break;
									case 'locateme':
										this.doLocateMe();
									break;
								}
							}.bind(this),
							'placeNear': event.originalEvent.target,
							'items': items
						});
					}
				} catch(e) {
					// Nevermind
				}
			break;
			case 'velocity':
					var items = [];
					items.push({'label': $L({'value':"Current speed", 'key':'current_speed'}) });
					items.push({'label': this.commandMenuVelocity, 'command': 'none'});
					items.push({'label': $L("Heading") });
					items.push({'label': this.commandMenuHeading, 'command': 'none'});
					this.controller.popupSubmenu({
						'onChoose': function(command) {}.bind(this),
						'placeNear': event.originalEvent.target,
						'items': items
					});
			break;
			case 'usercoords':
					this.defineUserCoords();
			break;
			case 'locateme':
					this.doLocateMe();
			break;
			case 'savewaypoint':
					this.prepareSaveWaypoint();
			break;
			case 'tutorial':
					this.showTutorial();
			break;
			case 'googlemaps':
				var url = "http://maps.google.com/?q="+ escape(this.parameters['latitude'].toFixed(5) +","+ this.parameters['longitude'].toFixed(5)) +"("+ escape(this.parameters['title']) +")@" + this.parameters['latitude'] +","+ this.parameters['longitude'] +"&t=h&z=17";
				this.controller.serviceRequest('palm://com.palm.applicationManager', {
					'method': 'open',
					'parameters': {
						'target': url
					}
				});
			break;
			case 'mappingtool':
				var params = Geocaching.format4Maptool(this.parameters['waypoints']);
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
			break;
			default:
				break;
		}
	}
}

CompassAssistant.prototype.showTutorial = function() {
	Geocaching.settings['tutorials'].compass = true;
	Geocaching.saveSettings();

	this.controller.setMenuVisible(Mojo.Menu.commandMenu, false);
	this.controller.showDialog({
		'template': 'compass/tutorial-scene',
		'assistant': new CompassTutorialAssistant(
			this,
			function() {
				this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
			}.bind(this)
		)
	});
}

CompassAssistant.prototype.defineUserCoords = function() {

	var params = {
		'name': $L({'value':"User defined",'key':'user_defined'}) +" #"+ (this.parameters.waypoints.length +1)
	};
	
	//  Add last latitude here 
	if(this.latitude != null && this.longitude != null) {
		params['lat'] = Geocaching.parseCoordinate(new String(this.latitude), 'lat')['string'];
		params['lon'] = Geocaching.parseCoordinate(new String(this.longitude), 'lon')['string'];
	};
	
	this.controller.setMenuVisible(Mojo.Menu.commandMenu, false);
	this.controller.showDialog({
		'template': 'compass/usercoords-scene',
		'preventCancel': true,
		'assistant': new UsercoordsAssistant(
			params,
			this,
			function(wptName, latitude, longitude) {
				if(this.userCoords(wptName, latitude, longitude)) {
					// Save waypoint directly only on compass opened from cache
					if(typeof(this.parameters['geocode']) != 'undefined') {
						this.saveWaypoint(wptName, latitude, longitude);
					}
				}
			}.bind(this),
			function() {
				this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
			}.bind(this)
		)
	});
}

CompassAssistant.prototype.userCoords = function(wptName, latitude, longitude) {
	if(latitude == false)
		return false;

	var lat = Geocaching.parseCoordinate(latitude);
	var lon = Geocaching.parseCoordinate(longitude);

	if(typeof(lat['coordinate']) == 'undefined') {
		this.controller.showAlertDialog({
			'preventCancel': true,
			'onSuccess': function(){},
			'title': $L("Coordinates"),
			'message': $L({'value': "Unknown format of coordinates in Latitude.", 'key': 'unknown_format_in_latitude'}),
			'choices': [{'label' :$L("Close"), 'type': 'primary'} ]
		});
		return false;
	}

	if(typeof(lon['coordinate']) == 'undefined') {
		this.controller.showAlertDialog({
			'preventCancel': true,
			'onSuccess': function(){},
			'title': $L("Coordinates"),
			'message': $L({'value': "Unknown format of coordinates in Longitude.", 'key': 'unknown_format_in_longitude'}),
			'choices': [{'label':$L("Close"), 'type':'primary'}]
		});
		return false;
	}

	var wpt = this.parameters.waypoints.length;

	if(wptName == '') {
		wptName = $L({'value':"User defined",'key':'user_defined'}) +" #"+ (wpt+1);
	}

	this.parameters['title'] = wptName;
	this.parameters['latitude'] = lat['coordinate'];
	this.parameters['longitude'] = lon['coordinate'];

	this.parameters.waypoints.push({
		'title': this.parameters['title'],
		'latitude': this.parameters['latitude'],
		'longitude': this.parameters['longitude'],
		'wptType': 'usercoord',
		'type': 'usercoord'
	});
	this.controller.get('title').update(this.parameters['title']);

	this.isTarget = true;
	this.appMenuModel['items'] = this.generateAppMenu();
	this.controller.modelChanged(this.appMenuModel);
	this.controller.get('arrow').show();
	return true;
}

CompassAssistant.prototype.doLocateMe = function() {
	if(!this.locateMe) {
		// Begin locating
		this.locateMe = true;
		this.locateDB = [];
		this.controller.get('message_locateme').show();
		this.controller.get('message').show();
	} else {
		// Save coordinates
		this.locateMe = false;

		// Calculate average position
		var len = this.locateDB.length;
		var alat=0, alon=0;
		for(var z=0; z<len; z++) {
			alat += this.locateDB[z]['lat'];
			alon += this.locateDB[z]['lon'];
		}
		this.controller.setMenuVisible(Mojo.Menu.commandMenu, false);
		this.controller.showDialog({
			'template': 'compass/usercoords-scene',
			'preventCancel': true,
			'assistant': new UsercoordsAssistant(
				{
					'name': $L({'value':"User defined",'key':'user_defined'}) +" #"+ (this.parameters.waypoints.length+1),
					'lat': Geocaching.parseCoordinate(new String(alat/len), 'lat')['string'],
					'lon': Geocaching.parseCoordinate(new String(alon/len), 'lon')['string'],
					'submit': $L("Save & Navigate")
				},
				this,
				function(wptName, latitude, longitude) {
					if(this.userCoords(wptName, latitude, longitude)) {
						this.saveWaypoint(wptName, latitude, longitude);
					}
				}.bind(this),
				function() {
					this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
				}.bind(this)
			)
		});
		delete(len); delete(alat); delete(alon);
	}
	this.appMenuModel['items'] = this.generateAppMenu();
	this.controller.modelChanged(this.appMenuModel);
}

CompassAssistant.prototype.prepareSaveWaypoint = function() {
	// Check, if any target is specified
	if(typeof(this.parameters['latitude']) == 'undefined' || typeof(this.parameters['longitude']) == 'undefined') {
		return false;
	}

	var wptName = this.parameters['title'];
	var latitude = this.parameters['latitude'];
	var longitude = this.parameters['longitude']

	this.controller.setMenuVisible(Mojo.Menu.commandMenu, false);
	this.controller.showDialog({
		'template': 'compass/usercoords-scene',
		'preventCancel': true,
		'assistant': new UsercoordsAssistant(
			{
				'name': wptName,
				'lat': Geocaching.parseCoordinate(new String(latitude), 'lat')['string'],
				'lon': Geocaching.parseCoordinate(new String(longitude), 'lon')['string'],
				'submit': $L("Save")
			},
			this,
			function(wptName, latitude, longitude) {
				if(this.userCoords(wptName, latitude, longitude)) {
					this.saveWaypoint(wptName, latitude, longitude);
				}
			}.bind(this),
			function() {
				this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
			}.bind(this)
		)
	});
	delete(len); delete(alat); delete(alon);

	this.appMenuModel['items'] = this.generateAppMenu();
	this.controller.modelChanged(this.appMenuModel);
}

CompassAssistant.prototype.saveWaypoint = function(wptName, latitude, longitude) {
	var ts = Math.round(new Date().getTime() / 1000);
	var lat = Geocaching.parseCoordinate(latitude);
	var lon = Geocaching.parseCoordinate(longitude);

	if(typeof(this.parameters['geocode']) != 'undefined') {
		// Add as user-waypoint to cache
		Geocaching.db.transaction( 
			(function (transaction) { 
				Mojo.Log.error('Iam here');
				transaction.executeSql('select "userdata" from "caches" where "gccode"= ?', [this.parameters['geocode']],
					function(transaction, results) {
						if(results.rows.length != 1) return;
						var item = results.rows.item(0);
						var userdata;
						
						// Load userdata
						try {
							userdata = unescape(item['userdata']).evalJSON();	
						} catch(e) {
							userdata = {
								'waypoints': new Array()
							}
						}

						// Create array
						if(typeof(userdata['waypoints']) == 'undefined') {
								userdata['waypoints'] = new Array();
						}

						var _waypoint = {};
						_waypoint['type'] = 'usercoord';
						_waypoint['prefix'] = 'UD';
						_waypoint['lookup'] = ts;
						_waypoint['name'] = wptName;
						_waypoint['latitude'] = Number(lat['coordinate']);
						_waypoint['longitude'] = Number(lon['coordinate']);
						_waypoint['latitudeString'] = Geocaching.parseCoordinate(_waypoint['latitude'], 'lat')['string'];
						_waypoint['longitudeString'] = Geocaching.parseCoordinate(_waypoint['longitude'], 'lon')['string'];
						_waypoint['latlon'] = _waypoint['latitudeString'] +" "+ _waypoint['longitudeString'];
						_waypoint['note'] = '';
						
						userdata['waypoints'].push(Object.clone(_waypoint));
						cache[this.geocode].userdata['waypoints'] = userdata['waypoints'];
						
						transaction.executeSql('UPDATE "caches" SET "userdata"=? WHERE "gccode"= ?', [Object.toJSON(userdata), this.parameters['geocode']],
							function(transaction, result) {
								Mojo.Controller.getAppController().showBanner({'messageText': $L("Waypoint saved to cache...")}, '', 'compass');
							}.bind(this),
							function(transaction, error) {
								Mojo.Controller.getAppController().showBanner({'messageText': $L("Error occured when saving waypoint...")}, '', 'compass');
								Mojo.Log.error("Error executing: %j", error);
							}.bind(this)
						);

					}.bind(this),
					function(transaction, error) {
						Mojo.Log.error("Error executing: %j", error);
					}.bind(this)
				);
			}).bind(this)
		);
	} else {
		// Add as waypoint to Favourites
		Geocaching.db.transaction( 
			(function (transaction) { 
				var _cache = {}
				_cache['latitude'] = Number(lat['coordinate']);
				_cache['longitude'] = Number(lon['coordinate']);
				_cache['latitudeString'] = Geocaching.parseCoordinate(_cache['latitude'], 'lat')['string'];
				_cache['longitudeString'] = Geocaching.parseCoordinate(_cache['longitude'], 'lon')['string'];
				_cache['latlon'] = _cache['latitudeString'] +" "+ _cache['longitudeString'];
				_cache['geocode'] = "UD"+ts;
				_cache['name'] = wptName;
				_cache['found'] = false;
				_cache['archived'] = false
				_cache['disabled'] = false;
				_cache['cacheid'] = '';
				_cache['shortdesc']= '';
				_cache['description'] = '';
				_cache['difficulty'] = '?';
				_cache['terrain'] = '?';
				_cache['size'] = '';
				_cache['type'] = 'Waypoint';
				_cache['hint'] = '';
				_cache['owner'] = '';
				_cache['location'] = '';
				_cache['favourite'] = true;
				_cache['needsmaint'] = false;
				_cache['members'] = false;
				_cache['updated'] = ts;
				_cache['waypoints'] = [];
				_cache['logs'] = [];

				var query = 'INSERT INTO "caches"("gccode", "favourite", "found", "updated", "latitude", "longitude", "json") VALUES ("'+
					escape(_cache['geocode']) + '", 1, ' + 
					escape(_cache['found']?1:0) + ', ' + 
					escape(_cache['updated']) + ', ' +
					escape(_cache['latitude']) + ', ' +
					escape(_cache['longitude']) + ', "' +  
					escape(Object.toJSON(_cache)) +'"); GO;';
				transaction.executeSql(query, []);
			}).bind(this)
		);
	}
}