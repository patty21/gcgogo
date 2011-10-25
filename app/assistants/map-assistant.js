function MapAssistant(params) {
	this.params = params;
	Geocaching['lastActiveMap'] = this;
}

MapAssistant.prototype.setup = function() {
	this.map = null; // Google Maps map
	this.boundsChanged = null; // Timer for bounds changing
	this.loadMarkersInterval = null; // Timer for reloading markers
	
	this.userToken = null; // User Token to work with map
	
	this.caches = []; // Visible caches
	this.geocachers = []; // Visible geocachers (go4cache.com)
	this.markers = {}; // Markers
	this.markersIcons = {}; // Icons for markers
	this.myMarker = undefined; // User marker

	this.zoomWarning = true; // Zoom Warning indicator
	this.bouncesChanged = true; // Bounds changed indicator
	this.highSpeed = false; // High speed indicator 
	this.lastBouncesReloaded = 0; // Timestamp

	// GPS data
	this.latitude = null; // Last known latitude from GPS
	this.longitude = null; // Last known longitude from GPS
	this.heading = null; // Last known direction  from GPS
	this.speed = null; // Last known speed from GPS
	this.altitude = null; // Last known altitude from GPS
	this.followMe = false; // Follow myMarker indicator

	// User Data
	this.userData = {
		'distance': 0, // Total traveled distance
		'lastPoint': { // Last known position of user
			'lat': null,
			'lon': null,
			'alt': null
		},
		'lastPolyPoint': { // Last known position of user for path purposes
			'lat': null,
			'lon': null
		},
		'path': [] // Path
	};

	//  Spinner
	this.controller.setupWidget('loading-spinner', 
		this.spinnerLAttrs = {
			'spinnerSize': 'large'
		},
		this.spinnerModel = {
			'spinning': true
		}
	);
	
	// Pixi detection
	try {
		if(Mojo.Environment.DeviceInfo['screenHeight'] <= 400) {
			this.controller.get('map').addClassName('pixy');
		}
	} catch(e) { }
	
	// Get user token
	Geocaching.accounts['geocaching.com'].loadMapPage( {},
		function(userToken) {
			this.userToken = userToken;
		}.bind(this),
		function() {}
	);

	// Initialize Google Maps
	var script = document.createElement("script");
	script.src = "http://maps.google.com/maps/api/js?sensor=true&callback=initMap";
	script.type = "text/javascript";
	document.getElementsByTagName("head")[0].appendChild(script);
	
	this.controller.setupWidget(Mojo.Menu.commandMenu, {'menuClass': 'no-fade'},
		this.commandMenuModel = {
			'items':	[
				{'label': "o", 'iconPath':'images/menu-icon-myspot-off.png', 'command': 'followme'},
				this.commandMenuMapTools = {'items': [
					{'label': "-", 'iconPath':'images/menu-icon-minus.png', 'command': 'zoomout'},
					{'label': "^", 'iconPath':'images/menu-icon-profile-clipping.png', 'command': 'maptype'},
					{'label': "+", 'iconPath':'images/menu-icon-plus.png', 'command': 'zoomin'}
					
				]}
			],
			'visible': false
		}
	);
	
	Mojo.Event.listen(this.controller.document, 'gesturestart', this.handleGestureStart.bindAsEventListener(this), false);
	Mojo.Event.listen(this.controller.document, 'gesturechange', this.handleGestureChange.bindAsEventListener(this), false);
	Mojo.Event.listen(this.controller.document, 'gestureend', this.handleGestureEnd.bindAsEventListener(this), false);
};

MapAssistant.prototype.activate = function(event) {
	this.turnScreenON();
	
	if (this.controller.stageController.setWindowOrientation) {
			this.controller.stageController.setWindowOrientation('free');
	}
};

MapAssistant.prototype.deactivate = function(event) {
	//this.turnScreenOFF();
};

MapAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.document, 'gesturestart', this.handleGestureStart.bindAsEventListener(this), false);
	Mojo.Event.stopListening(this.controller.document, 'gesturechange', this.handleGestureChange.bindAsEventListener(this), false);
	Mojo.Event.stopListening(this.controller.document, 'gestureend', this.handleGestureEnd.bindAsEventListener(this), false);

	if (this.controller.stageController.setWindowOrientation) {
		this.controller.stageController.setWindowOrientation('up');
	}
	
	this.turnScreenOFF();
	
	try {
		this.compass.cancel();
	} catch(e) {}
};

MapAssistant.prototype.turnScreenON = function() {
	try {
		this.controller.stageController.setWindowProperties({'blockScreenTimeout': true});
	} catch(e) {}
}

MapAssistant.prototype.turnScreenOFF = function() {
	try {
		this.controller.stageController.setWindowProperties({'blockScreenTimeout': false});
	} catch(e) {}
}

MapAssistant.prototype.initMap = function(event) {
	this.controller.get('loading-spinner').hide();
	this.controller.get('map').show();
	
	var mapOptions = {
		'zoom': 15,
		'disableDefaultUI': true,
		'center': new google.maps.LatLng(this.params['latitude'], this.params['longitude']),
		'mapTypeId': google.maps.MapTypeId.ROADMAP
  };

	this.map = new google.maps.Map(this.controller.get('map'), mapOptions);
	
	this.markersIcons['mymarker'] = new google.maps.MarkerImage('images/go4cache-myspot.png',
		new google.maps.Size(12, 12),
		new google.maps.Point(0,0),
		new google.maps.Point(6,6)
	);
	
	this.markersIcons['geocacher'] = new google.maps.MarkerImage('images/go4cache-spot.png',
		new google.maps.Size(12, 12),
		new google.maps.Point(0,0),
		new google.maps.Point(6,6)
	);
	
	this.markersIcons['traditional'] = new google.maps.MarkerImage('images/traditional_pin.png',
		new google.maps.Size(20, 23),
		new google.maps.Point(0,0),
		new google.maps.Point(10,23)
	);

	this.markersIcons['multi'] = new google.maps.MarkerImage('images/multi_pin.png',
		new google.maps.Size(20, 23),
		new google.maps.Point(0,0),
		new google.maps.Point(10,23)
	);
	
	this.markersIcons['mystery'] = new google.maps.MarkerImage('images/mystery_pin.png',
		new google.maps.Size(20, 23),
		new google.maps.Point(0,0),
		new google.maps.Point(10,23)
	);
	
	this.markersIcons['letterbox'] = new google.maps.MarkerImage('images/letterbox_pin.png',
		new google.maps.Size(20, 23),
		new google.maps.Point(0,0),
		new google.maps.Point(10,23)
	);
	
	this.markersIcons['whereigo'] = new google.maps.MarkerImage('images/whereigo_pin.png',
		new google.maps.Size(20, 23),
		new google.maps.Point(0,0),
		new google.maps.Point(10,23)
	);
	
	this.markersIcons['event'] = new google.maps.MarkerImage('images/event_pin.png',
		new google.maps.Size(20, 23),
		new google.maps.Point(0,0),
		new google.maps.Point(10,23)
	);
	
	this.markersIcons['mega-event'] = new google.maps.MarkerImage('images/mega-event_pin.png',
		new google.maps.Size(20, 23),
		new google.maps.Point(0,0),
		new google.maps.Point(10,23)
	);
	
	this.markersIcons['earth'] = new google.maps.MarkerImage('images/earth_pin.png',
		new google.maps.Size(20, 23),
		new google.maps.Point(0,0),
		new google.maps.Point(10,23)
	);
	
	this.markersIcons['cito'] = new google.maps.MarkerImage('images/cito_pin.png',
		new google.maps.Size(20, 23),
		new google.maps.Point(0,0),
		new google.maps.Point(10,23)
	);
	
	this.markersIcons['virtual-cache'] = new google.maps.MarkerImage('images/virtual-cache_pin.png',
		new google.maps.Size(20, 23),
		new google.maps.Point(0,0),
		new google.maps.Point(10,23)
	);
	
	this.markersIcons['webcam'] = new google.maps.MarkerImage('images/webcam_pin.png',
		new google.maps.Size(20, 23),
		new google.maps.Point(0,0),
		new google.maps.Point(10,23)
	);
	
	this.markersIcons['found'] = new google.maps.MarkerImage('images/found_pin.png',
		new google.maps.Size(20, 23),
		new google.maps.Point(0,0),
		new google.maps.Point(10,23)
	);
	
	this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
	
	google.maps.event.addListener(this.map, 'bounds_changed', function() {
		try {
			window.clearTimeout(this.boundsChanged);
		} catch(e) { }
		this.boundsChanged = window.setTimeout(this.doBouncesChanged.bind(this), 750);
	}.bind(this));
	
	this.compass = this.controller.serviceRequest('palm://com.palm.location', {
		'method': 'startTracking',
		'parameters': {
			'accuracy': 1,
			'maximumAge': 0,
			'responseTime': 1,
			'subscribe': true
		},
		'onSuccess': this.gpsChanged.bind(this)
	});
	
	
	this.loadMarkersInterval = window.setInterval(this.loadMarkers.bind(this), 1250);
	
};

MapAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.command) {
		switch(event.command) {
			case 'zoomin':
				this.map.setZoom(this.map.getZoom()+1);
			break;
			case 'zoomout':
				this.map.setZoom(this.map.getZoom()-1);
			break;
			case 'maptype':
				this.controller.popupSubmenu({
					'onChoose': function(command) {
						switch(command)
						{
							case 'satellite':
								this.map.setMapTypeId(google.maps.MapTypeId.HYBRID);
							break;
							case 'terrain':
								this.map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
							break;
							default:
								this.map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
							break;
						}
					}.bind(this),
					'placeNear': event.originalEvent.target,
					'items': [
						{'label': $L("Select map type") },
						{'label': $L("Roadmap"), 'command': 'roadmap'},
						{'label': $L("Satellite"), 'command': 'satellite'},
						{'label': $L("Terrain"), 'command': 'terrain'}
					]
				});
			break;
			case 'followme':
				if(this.followMe) {
					this.commandMenuModel['items'] = [
						{'label': "o", 'iconPath':'images/menu-icon-myspot-off.png', 'command': 'followme'},
						this.commandMenuMapTools
					];
					this.followMe = false;
				} else {
					this.commandMenuModel['items'] = [
						{'label': "o", 'iconPath':'images/menu-icon-myspot.png', 'command': 'followme'},
						this.commandMenuMapTools
					];
					this.followMe = true;
					// Pan to my location
					if(this.latitude != null && this.longitude != null) {
						this.map.panTo(new google.maps.LatLng(this.latitude, this.longitude));
					}
				}
				this.controller.modelChanged(this.commandMenuModel);
		}
	}
};

MapAssistant.prototype.handleGestureStart = function(event) {
	this.map.setOptions({'draggable': false});
	this.previousScale = event.scale;
};

MapAssistant.prototype.handleGestureChange = function(event) {
	event.stop();
	var d = this.previousScale - event.scale;
	if(Math.abs(d)>0.25) {
		var z = this.map.getZoom() + (d>0?-1:+1);
		this.map.setZoom(z);
		this.previousScale = event.scale;
	}
};

MapAssistant.prototype.handleGestureEnd = function(event) {
	event.stop();
	this.map.setOptions({'draggable': true});
};

MapAssistant.prototype.orientationChanged = function(orientation) {
	switch(orientation) {
		case 'left':
		case 'right':
			this.controller.get('map').addClassName('map-landscape');
		break;
		default:
			this.controller.get('map').removeClassName('map-landscape');
	};

	if(this.map != null) {
		google.maps.event.trigger(this.map, 'resize');
	}
};

MapAssistant.prototype.gpsChanged = function(event) {
	if(event.errorCode != 0) {
		return false;
	}

	this.accuracy = event.horizAccuracy;
	if(this.accuracy) {
		
		
		var ts = Math.round(new Date().getTime() / 1000);
		this.latitude = event.latitude.toFixed(5);
		this.longitude = event.longitude.toFixed(5);
		this.heading = event.heading;
		this.speed = event.velocity;
		this.altitude = event.altitude;
		
		// Check for speed and altitude
		if(this.speed == -1) {
			this.speed = 0; // Speed is unknown
		}

		if(this.altitude == -1) {
			if(this.userData['lastPoint']['alt'] != null) {
				this.altitude = this.userData['lastPoint']; // Use last altitude
			} else {
				this.altitude = 0; // Use zero altitude
			}
		}

		var latLon = new google.maps.LatLng(this.latitude, this.longitude);
		var distance = 0;
		var polyDistance = 0;
	
		if(this.speed >= 5 && this.followMe) {
			this.controller.get('speed').update(Geocaching.getHumanSpeed(this.speed));
			if(this.hiSpeed == false) {
				this.controller.get('dashboard').hide();
				this.controller.get('speed').show();
				this.controller.setMenuVisible(Mojo.Menu.commandMenu, false);
			}
			this.hiSpeed = true;
		} else {
			if(this.hiSpeed == true) {
				this.controller.get('speed').hide();
				this.controller.get('dashboard').show();
				this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
			}
			this.hiSpeed = false;
		}
	
		if(typeof(this.mymarker) == 'undefined') {
			this.mymarker = new google.maps.Marker({
				'position': latLon, 
				'map': this.map, 
				'title': 'Me',
				'icon': this.markersIcons['mymarker']
			});
		} else {
			// Recalculate distance
			if(this.userData['lastPoint']['lat'] == null) {
				distance = 0;
			} else {
				distance = Geocaching.getDistance(this.latitude, this.longitude, this.userData['lastPoint']['lat'], this.userData['lastPoint']['lon']).toFixed(5);
			}
		}
		
		if(typeof(this.mypoly) == 'undefined') {
			var mypolyOptions = {
				'strokeColor': '#3333EE',
				'strokeOpacity': 0.6,
				'strokeWeight': 5
			}
			this.mypoly = new google.maps.Polyline(mypolyOptions);
			this.mypoly.setMap(this.map);
		}
		
		// Set new position to userData
		if(distance > 0 || this.userData['lastPoint']['lat'] == null) {
			if (this.accuracy <= Geocaching.settings['minimalaccuracy']) {
				this.userData['distance'] = Number((this.userData['distance']-0) + (distance-0)).toFixed(3); // Raise distance
			}

			this.mymarker.setPosition(latLon); // Set my marker position

			//  Check poly line distance
			if(this.userData['lastPolyPoint']['lat'] == null) {
				polyDistance = 5; // Minimal distance for hiSpeed change
			} else {
				polyDistance = Geocaching.getDistance(this.latitude, this.longitude, this.userData['lastPolyPoint']['lat'], this.userData['lastPolyPoint']['lon']) * 1000;
			}
			
			// Fill the path
			if ((!this.hiSpeed && polyDistance >= 1) || polyDistance >= 5) {
				var path = this.mypoly.getPath();
				var pathLen = path.push(latLon); // Put new coordinates to path and return length

				if(pathLen > 250) {
					path.removeAt(0); // Remove first coordinates from path
				}

				// Fill last known position for path purposes
				this.userData['lastPolyPoint'] = {
					'lat': this.latitude,
					'lon': this.longitude,
				};
				
				// Fill path
				this.userData['path'].push({
					'l': this.latitude,
					'l': this.longitude,
					's': this.speed,
					'a': this.altitude
				});
			}

			// Center map to my marker
			if(this.followMe) {
				this.map.panTo(latLon);
			}

			this.userData['lastPoint'] = {
				'lat': this.latitude,
				'lon': this.longitude,
				'alt': this.altitude
			};
		}

		this.controller.get('dashboard').update($L("Traveled: <strong>#{distance}</strong> <span class=\"separator\">|</span> <span>Accuracy <strong>#{accuracy}</strong></span>").interpolate({
			'distance': Geocaching.getHumanDistance(this.userData['distance']),
			'accuracy': Geocaching.getHumanDistance(this.accuracy/1000)
		}));

		// Share GPS location
		if(Geocaching.settings['go4cache']) {
			Geocaching.accounts['go4cache'].sendLocation(this.latitude, this.longitude, 'discovering');
		}
	}
};

MapAssistant.prototype.doBouncesChanged = function() {
	this.bouncesChanged = true;
};

MapAssistant.prototype.loadMarkers = function() {
	var ts = Math.round(new Date().getTime() / 1000);
	
	if(this.userToken == null ) {
		return true;
	}

	if(this.followMe) {
		if(this.lastBouncesReloaded > ts-14) {
			return true;
		}
	}

	if(this.bouncesChanged == false) {
		return true;
	}

	this.lastBouncesReloaded = ts;
	this.bouncesChanged = false;
	
	var bounds = this.map.getBounds();
	var boundsSW = bounds.getSouthWest();
	var boundsNE = bounds.getNorthEast();

	var params = {
		'token': this.userToken
	};
	
	params['lat1'] = boundsSW.lat();
	params['lon1'] = boundsSW.lng();
	params['lat2'] = boundsNE.lat();
	params['lon2'] = boundsNE.lng();

	Geocaching.accounts['geocaching.com'].loadCachesOnMap(params, this.buildMarkers.bind(this), function() {});
	
	// Load go4cache users in this place
	if(Geocaching.settings['go4cache']) {
		Geocaching.accounts['go4cache'].getCachers(params, this.buildGeocachersMarkers.bind(this));
	}
	
	this.cleanInvisibleMarkers(bounds);
};

MapAssistant.prototype.buildMarkers = function(cachesCount, caches) {
	if(cachesCount > 500) {
		if(this.zoomWarning) {
			Mojo.Controller.getAppController().showBanner({'messageText': $L("Too many caches to display. Zoom in.")}, 'map');
			this.zoomWarning = false;
		}
		return false;
	}
	
	this.zoomWarning = true;
	
	var cachesLen = caches.length;
	this.caches = caches;

	var gccode, lat, lon, latLon, name, cacheType, icon, cId, cActive;
	for(var z=0; z<cachesLen; z++) {
		try {
			gccode = caches[z]['gc'];
			lat = caches[z]['lat'];
			lon = caches[z]['lon'];
			latLon = new google.maps.LatLng(lat, lon);
			name = caches[z]['nn'];
			cId = caches[z]['id'];
			cActive = caches[z]['ia'];

			cacheType = caches[z]['ctid'];
			icon = this.markersIcons[cacheTypesNumbers[cacheType]];
			
			if(caches[z]['f']) {
				icon = this.markersIcons['found'];
			}
			
			if(typeof(this.markers[gccode]) == 'undefined') {
				this.markers[gccode] = new google.maps.Marker({
					'position': latLon, 
					'map': this.map, 
					'title': gccode,
					'icon': icon,
					'cacheName': name,
					'cacheType': cacheType,
					'cacheId': cId,
					'cacheDisabled': !cActive,
					'lat': lat,
					'lon': lon
				});
				
				this.buildBubble(this.markers[gccode], gccode);
			}
		} catch(e) {
			Mojo.Log.error(Object.toJSON(e));
		}
	}
};

MapAssistant.prototype.buildGeocachersMarkers = function(geocachers) {
	var geocachersLen = geocachers.length;
	this.geocachers = geocachers;

	var username, lat,lon, located, client;
	for(var z=0; z<geocachersLen; z++) {
		try {
			username = geocachers[z]['user'];
			lat = geocachers[z]['latitude'];
			lon = geocachers[z]['longitude'];
			latLon = new google.maps.LatLng(lat, lon);
			located = geocachers[z]['lf'];
			client = geocachers[z]['client'];
			
			if(typeof(this.markers['geocacher-'+ username]) == 'undefined') {
				this.markers['geocacher-'+ username] = new google.maps.Marker({
					'position': latLon, 
					'map': this.map, 
					'title': username,
					'icon': this.markersIcons['geocacher'],
					'username': username,
					'located': located,
					'client': client
				});
				
				this.buildGeocacherBubble(this.markers['geocacher-'+ username], username);
			}
		} catch(e) {
			Mojo.Log.error(Object.toJSON(e));
		}
	}
};

MapAssistant.prototype.buildBubble = function(marker, gccode) {
	google.maps.event.addListener(marker, 'click', function() {
		this.controller.setMenuVisible(Mojo.Menu.commandMenu, false);
		this.controller.showDialog({
			'template': 'map/cache-scene',
			'preventCancel': true,
			'assistant': new MapCacheAssistant(
				{
					'gccode': gccode,
					'cacheName': marker['cacheName'],
					'cacheType': marker['cacheType'],
					'cacheId': marker['cacheId'],
					'cacheDisabled': marker['cacheDisabled'],
					'cacheLocation': {
						'lat': marker['lat'],
						'lon': marker['lon']
					},
					'userLocation': this.userData['lastPoint'],
					'userToken': this.userToken
				},
				this,
				function() {
				}.bind(this),
				function() {
					this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
				}.bind(this)
			)
		});
	}.bind(this));
};

MapAssistant.prototype.buildGeocacherBubble = function(marker, username) {
	google.maps.event.addListener(marker, 'click', function() {
		this.controller.setMenuVisible(Mojo.Menu.commandMenu, false);
		this.controller.showDialog({
			'template': 'map/geocacher-scene',
			'preventCancel': true,
			'assistant': new MapGeocacherAssistant(
				{
					'username': username,
					'located': marker['located'],
					'client': marker['client']
				},
				this,
				function() {
				}.bind(this),
				function() {
					this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
				}.bind(this)
			)
		});
	}.bind(this));
};

MapAssistant.prototype.cleanInvisibleMarkers = function(bounds) {
	var pos;
	for (x in this.markers) {
		try {
			pos = this.markers[x].getPosition();
			if(bounds.contains(pos) == false) {
					this.markers[x].setMap(null);
					delete(this.markers[x]);
			}
		} catch(e) {
			Mojo.Log.error(Object.toJSON(e));
		}
	}
};