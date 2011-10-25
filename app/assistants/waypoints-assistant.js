function WaypointsAssistant(gccode) {
	this.geocode = gccode;
}

WaypointsAssistant.prototype.setup = function() {
	this.controller.get('title').update($L("#{geocode}'s waypoints").interpolate({'geocode': this.geocode}));
	this.controller.get('icon').update('<img class="gc-icon" src="images/'+ cacheTypes[cache[this.geocode].type] +'.gif" />');
	this.controller.get('icon').className = 'icon img';

	var items = [];
	var z;
	this.wpts = cache[this.geocode].waypoints.clone();
	
	var prevLat = {
		'puzzle': cache[this.geocode].latitude,
		'stage': cache[this.geocode].latitude,
	};
	var prevLon = {
		'puzzle': cache[this.geocode].longitude,
		'stage': cache[this.geocode].longitude,
	};
	var prevName = {
		'puzzle': this.geocode,
		'stage': this.geocode,
	}
	
	// Add user waypoints
	try {
		var userWpts = cache[this.geocode].userdata['waypoints'];
		var userWptsLen = userWpts.length;
		if(userWptsLen > 0) {
			for(z=0; z<userWptsLen; z++) {
				this.wpts.push(userWpts[z]);
			}
		}
	} catch(e) {
		Mojo.Log.error(Object.toJSON(e));
	}
	
	var wp, coords, _distance, _direction;
	var wptsLen = this.wpts.length;
	
	if(wptsLen > 0) {
		for(z=0; z<wptsLen; z++) {
			wp = this.wpts[z];
			coords = wp['latlon'];
			distance = '';

			// Waypoint have coordinates
			if(typeof(wp['latitude'])!='undefined' && typeof(wp['longitude'])!='undefined') {
				coords = wp.latitudeString +" "+ wp.longitudeString;
				
				if(wp['type'] == 'puzzle' || wp['type'] == 'stage') {
					_distance = Geocaching.getHumanDistance(Geocaching.getDistance(prevLat[wp['type']], prevLon[wp['type']], wp['latitude'], wp['longitude']));
					_direction = Geocaching.getSimpleAzimuth(Geocaching.getAzimuth(prevLat[wp['type']], prevLon[wp['type']], wp['latitude'], wp['longitude']));

					distance = '<div class="small">';
					distance += $L("Distance: <strong>#{distance}</strong><img src='images/compass_#{direction}.gif' /> from <strong>#{target}</strong>").interpolate({
						'distance': _distance,
						'target': prevName[wp['type']],
						'direction': _direction
					});
					distance += '</div>';
					
					prevLat[wp['type']] = wp['latitude'];
					prevLon[wp['type']] = wp['longitude'];
					prevName[wp['type']] = wp['name'];
				} else {
					_distance = Geocaching.getHumanDistance(Geocaching.getDistance(cache[this.geocode].latitude, cache[this.geocode].longitude, wp['latitude'], wp['longitude']));
					_direction = Geocaching.getSimpleAzimuth(Geocaching.getAzimuth(cache[this.geocode].latitude, cache[this.geocode].longitude, wp['latitude'], wp['longitude']));

					distance = '<div class="small">';
					distance += $L("Distance: <strong>#{distance}</strong><img src='images/compass_#{direction}.gif' /> from <strong>#{target}</strong>").interpolate({
						'distance': _distance,
						'target': this.geocode,
						'direction': _direction
					});
					distance += '</div>';
				}
			}

			items.push({
				'id': z,
				'prefix': wp['prefix'],
				'lookup': wp['lookup'],
				'coords': coords,
				'distance': distance,
				'name': wp['name'],
				'type': wp['type'],
				'note': wp['note']
			});
		}
	}

	this.controller.setupWidget("waypoints-list",
		{
			'itemTemplate': 'waypoints/list-item',
			'listTemplate': 'waypoints/list-container',
			'emptyTemplate':'waypoints/list-empty',
			'addItemLabel': $L("Add waypoint")
		},
		this.waypointsListModel = {
			'listTitle': $L("Waypoints"),
			'items' : items
		}
	);

	this.handleWaypointListTap = this.handleWaypointListTap.bindAsEventListener(this);
	Mojo.Event.listen(this.controller.get('waypoints-list'), Mojo.Event.listTap, this.handleWaypointListTap);
	
	this.handleWaypointListAdd = this.handleWaypointListAdd.bind(this);
	Mojo.Event.listen(this.controller.get('waypoints-list'),Mojo.Event.listAdd, this.handleWaypointListAdd);
}

WaypointsAssistant.prototype.activate = function(event) {
}

WaypointsAssistant.prototype.deactivate = function(event) {
}

WaypointsAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('waypoints-list'), Mojo.Event.listTap, this.handleWaypointListTap);
	Mojo.Event.stopListening(this.controller.get('waypoints-list'),Mojo.Event.listAdd, this.handleWaypointListAdd);
}

WaypointsAssistant.prototype.handleWaypointListTap = function(event) {
	if(typeof(event.item['id']) != 'undefined') {
		var waypoint = this.wpts[event.item['id']];
		if(typeof(waypoint['latitude'])!='undefined' && typeof(waypoint['longitude'])!='undefined') {
			if(Geocaching.settings['defaultnavigation'] == 'googlemaps') {
				var url = "http://maps.google.com/?q="+ escape(waypoint['latitude'].toFixed(5) +","+ waypoint['longitude'].toFixed(5)) +"("+ escape('Waypoint: '+waypoint['name']) +")@" + waypoint['latitude'] +","+ waypoint['longitude'] +"&t=h&z=17";
				this.controller.serviceRequest('palm://com.palm.applicationManager', {
					'method': 'open',
					'parameters': {
						'target': url
					}
				});
				return true;
			} else
			if(Geocaching.settings['defaultnavigation'] == 'mappingtool') {
				var params = Geocaching.format4Maptool([{
					'title': $L("Waypoint #{name}").interpolate({'name': waypoint['name']}),
					'latitude': waypoint['latitude'],
					'longitude': waypoint['longitude'],
					'wptType': 'waypoint',
					'type': waypoint['type']
				}]);
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
			} else {
				var waypoints = [];
				waypoints.push({
					'title': this.geocode,
					'latitude': cache[this.geocode].latitude,
					'longitude': cache[this.geocode].longitude
				});

				if(cache[this.geocode].waypoints.length > 0) {
					for(var z in cache[this.geocode].waypoints) {
						var wp = cache[this.geocode].waypoints[z];
						if(typeof(wp['latitude'])!='undefined' && typeof(wp['longitude'])!='undefined') {
							waypoints.push({
								'title': $L("Waypoint #{name}").interpolate({'name': wp['name']}),
								'latitude': wp['latitude'],
								'longitude': wp['longitude']
							});
						}
					}
				}

				// Open compass
				if(Geocaching.settings['compassInNewCard']) {
					var appController = Mojo.Controller.getAppController();
					var f = function(stageController){
						stageController.pushScene(
							{
								'name': 'compass',
								'disableSceneScroller': true
							}, {
								'title': $L("Waypoint #{name}").interpolate({'name': waypoint['name']}),
								'latitude': waypoint['latitude'],
								'longitude': waypoint['longitude'],
								'waypoints': waypoints
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
							'title': $L("Waypoint #{name}").interpolate({'name': waypoint['name']}),
							'latitude': waypoint['latitude'],
							'longitude': waypoint['longitude'],
							'waypoints': waypoints
						}
					);
				}



			}
		}
	}
}

WaypointsAssistant.prototype.handleWaypointListAdd = function(event) {
	var params = {
		'name': $L({'value':"User defined",'key':'user_defined'}),
		'submit': $L("Save")
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
					this.saveWaypoint(wptName, latitude, longitude);
				}
			}.bind(this),
			function() {
				this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
			}.bind(this)
		)
	});
};

WaypointsAssistant.prototype.userCoords = function(wptName, latitude, longitude) {
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

	return true;
};

WaypointsAssistant.prototype.saveWaypoint = function(wptName, latitude, longitude) {
	var ts = Math.round(new Date().getTime() / 1000);
	var lat = Geocaching.parseCoordinate(latitude);
	var lon = Geocaching.parseCoordinate(longitude);

	// Add as user-waypoint to cache
	Geocaching.db.transaction( 
		(function (transaction) { 
			Mojo.Log.error('Iam here');
			transaction.executeSql('select "userdata" from "caches" where "gccode"= ?', [this.geocode],
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
					
					transaction.executeSql('UPDATE "caches" SET "userdata"=? WHERE "gccode"= ?', [Object.toJSON(userdata), this.geocode],
						function(transaction, result) {
							Mojo.Controller.getAppController().showBanner({'messageText': $L("Waypoint saved to cache...")}, '', 'compass');
							this.controller.stageController.swapScene('waypoints', this.geocode);
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
}
