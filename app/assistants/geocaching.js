var cacheSizeImages = {
	'0': 'not_chosen',
	'1': 'micro',
	'2': 'small',
	'3': 'regular',
	'4': 'large',
	'5': 'virtual',
	'6': 'other'
};

var cacheSizeNames = {
	'0': 'Not chosen',
	'1': 'Micro',
	'2': 'Small',
	'3': 'Regular',
	'4': 'Large',
	'5': 'Virtual',
	'6': 'Other'
};


var cacheSizeNo = {
	'not_chosen':'0',
	'micro':'1',
	'small':'2',
	'regular':'3',
	'large':'4',
	'virtual':'5',
	'other':'6'
};





var cacheTypes = {
	'Traditional Cache': 'traditional',
	'Multi-cache': 'multi',
	'Unknown Cache': 'mystery',
	'Letterbox Hybrid': 'letterbox',
	'Event Cache': 'event',
	'Mega-Event Cache': 'mega-event',
	'Earthcache': 'earth',
	'Cache In Trash Out Event': 'cito',
	'Webcam Cache': 'webcam',
	'Virtual Cache': 'virtual-cache',
	'Wherigo Cache': 'whereigo',
	'Waypoint': 'waypoint',
	'Geocache': 'geocache',
	'Groundspeak HQ': 'groundspeakhq',
	'Project APE Cache': 'projectape',
	'Lost and Found Event Cache': 'lostfoundevent',
	'Groundspeak Lost and Found Celebration': 'lostfoundcelebration',
	'GPS Adventures Exhibit': 'gpsadventures'
};

var cacheTypesNumbers = {
	'2': 'traditional',
	'3': 'multi',
	'8': 'mystery',
	'5': 'letterbox',
	'6': 'event',
	'453': 'mega-event', 
	'137': 'earth',
	'13': 'cito',
	'11': 'webcam',
	'4': 'virtual-cache',
	'1858': 'whereigo',
	'3773': 'groundspeakhq',
	'9': 'projectape',
	'3653': 'lostfoundevent',
	'3774': 'lostfoundcelebration',
	'maze': 'gpsadventures'
};

var cacheTypesIDs = {
	'Traditional Cache': '2',
	'Multi-cache': '3',
	'Unknown Cache': '8',
	'Letterbox Hybrid': '5',
	'Event Cache': '6',
	'Mega-Event Cache': '453',
	'Earthcache': '137',
	'Cache In Trash Out Event': '13',
	'Webcam Cache': '11',
	'Virtual Cache': '4',
	'Wherigo Cache': '1858',
	'Groundspeak HQ': '3773',
	'Project APE Cache': '9',
	'Lost and Found Event Cache': '3653',
	'Groundspeak Lost and Found Celebration': '3774',
	'GPS Adventures Exhibit': 'maze'
};

var cacheTypesColors = {
	'Traditional Cache': 'green',
	'Multi-cache': 'yellow',
	'Unknown Cache': 'blue',
	'Letterbox Hybrid': 'gray',
	'Event Cache': 'white',
	'Mega-Event Cache': 'white',
	'Earthcache': 'orange',
	'Cache In Trash Out Event': 'orange',
	'Webcam Cache': 'gray',
	'Virtual Cache': 'gray',
	'Wherigo Cache': 'blue',
	'Groundspeak HQ': 'green',
	'Project APE Cache': 'green',
	'Lost and Found Event Cache': 'green',
	'Groundspeak Lost and Found Celebration': 'white',
	'GPS Adventures Exhibit': 'white'
};

var cacheIDs = {
	'all': '9a79e6ce-3344-409c-bbe9-496530baf758',
	'traditional': '32bc9333-5e52-4957-b0f6-5a2c8fc7b257',
	'multi': 'a5f6d0ad-d2f2-4011-8c14-940a9ebf3c74',
	'mystery': '40861821-1835-4e11-b666-8d41064d03fe',
	'letterbox': '4bdd8fb2-d7bc-453f-a9c5-968563b15d24',
	'event': '69eb8534-b718-4b35-ae3c-a856a55b0874',
	'mega-event': '69eb8535-b718-4b35-ae3c-a856a55b0874',
	'earth': 'c66f5cf3-9523-4549-b8dd-759cd2f18db8',
	'cito': '57150806-bc1a-42d6-9cf0-538d171a2d22',
	'webcam': '31d2ae3c-c358-4b5f-8dcd-2185bf472d3d',
	'virtual-cache': '294d4360-ac86-4c83-84dd-8113ef678d7e',
	'groundspeakhq': '416f2494-dc17-4b6a-9bab-1a29dd292d8c',
	'projectape': '2555690d-b2bc-4b55-b5ac-0cb704c0b768',
	'lostfoundevent': '3ea6533d-bb52-42fe-b2d2-79a3424d4728',
	'lostfoundcelebration': 'af820035-787a-47af-b52b-becc8b0c0c88',
	'whereigo': '0544fa55-772d-4e5c-96a9-36a51ebcf5c9',
	'gpsadventures': '72e69af2-7986-4990-afd9-bc16cbbb4ce3'
};

var cacheIDsChoices = [
	{'label': $L("All Geocaches"), 'value': cacheIDs['all']},
	{'label': $L("Traditional Cache"), 'value': cacheIDs['traditional']},
	{'label': $L("Multi-cache"), 'value': cacheIDs['multi']},
	{'label': $L("Unknown Cache"), 'value': cacheIDs['mystery']},
	{'label': $L("Letterbox Hybrid"), 'value': cacheIDs['letterbox']},
	{'label': $L("Event Cache"), 'value': cacheIDs['event']},
	{'label': $L("Mega-Event Cache"), 'value': cacheIDs['mega-event']},
	{'label': $L("Earthcache"), 'value': cacheIDs['earth']},
	{'label': $L("Cache In Trash Out Event"), 'value': cacheIDs['cito']},
	{'label': $L("Groundspeak HQ"), 'value': cacheIDs['groundspeakhq']},
	{'label': $L("Lost and Found Event Cache"), 'value': cacheIDs['lostfoundevent']},
	{'label': $L("Groundspeak Lost and Found Celebration"), 'value': cacheIDs['lostfoundcelebration']},
	{'label': $L("Webcam Cache"), 'value': cacheIDs['webcam']},
	{'label': $L("Virtual Cache"), 'value': cacheIDs['virtual-cache']},
	{'label': $L("Project APE Cache"), 'value': cacheIDs['projectape']},
	{'label': $L("GPS Adventures Exhibit"), 'value': cacheIDs['gpsadventures']},
	{'label': $L("Wherigo Cache"), 'value': cacheIDs['whereigo']},

];

var waypointsTypes = {
	'flag': $L("Final location"),
	'stage': $L("Stage of Multicache"),
	'puzzle': $L("Question for Answer"),
	'pkg': $L("Parking Area"),
	'trailhead': $L("Trailhead"),
	'waypoint': $L("Waypoint")
}

var logTypes = [
		{'label': $L("Found It"), 'value': 2},
		{'label': $L("Didn't find it"), 'value': 3},
		{'label': $L("Write note"), 'value': 4},
		{'label': $L("Archive"), 'value': 5},
		{'label': $L("Will Attend"), 'value': 9},
		{'label': $L("Attended"), 'value': 10},
		{'label': $L("Enable Listing"), 'value': 23},
		{'label': $L("Post Reviewer Note"), 'value': 18}
];

var logTypesTrackable = [
		{'label': $L("Retrieve from cache"), 'value': 13},
		{'label': $L("Grab it"), 'value': 19},
		{'label': $L("Write note"), 'value': 4},
		{'label': $L("Discovered it"), 'value': 48}
];

var defaultnavigationIcons = {
	'builtin': 'images/icon-compass.png',
	'mappingtool': 'images/icon-mappingtool.png',
	'googlemaps': 'images/icon-googlemaps.png'
}

var cache = {};
var cacheTemplate = {
	'geocode': "",
	'cacheid': "",
	'guid': "",
	'type': "",
	'name': "",
	'owner': "",
	'hint': "",
	'size': "",
	'difficulty': 0,
	'terrain': 0,
	'location': "",
	'latitude': 0,
	'longitude': 0,
	'latlonorg': "",
	'shortdesc': "",
	'description': "",
	'disabled': false,
	'archived': false,
	'members': false,
	'needsmaint': false,
	'found': false,
	'own': false,
	'favourite': false,
	'updated': 0,
	'waypoints': [],
	'logs': [],
	'trackables': [],
	'spoilerImages': [],
	'galleryImagesCount': 0,
	'galleryImages': [],
	'attrs': [],
	'finds': 0,
	'dnfs': 0,
	'userdata': {}
};

var trackable = {};
var trackableTemplate = {
	'tbcode': "",
	'trackingCode': "",
	'travelid': "",
	'cacheid': "",
	'guid': "",
	'name': "",
	'owner': "",
	'location': "",
	'locationType': "user",
	'locationGuid': "",
	'about': "",
	'goal': "",
	'traveled': "",
	'image': "",
	'favourite': false,
	'updated': 0,
	'logs': []
};

var kmInMiles = 1/1.609344;
var deg2rad = Math.PI/180;
var rad2deg = 180/Math.PI;
var erad = 6371.0;
var ft2miles = 5280;
var ft2yard = 3;

var Geocaching = {
	'login' : {
		'username': null,
		'password': null,
		'uid': null
	},
	'accounts': {
		'geocaching.com': new GeocachingCom,
		'twitter': new Twitter,
		'go4cache': new Go4Cache
	},
	'logins': {
		'twitter': {
			'oauth_token': null,
			'oauth_token_secret': null,
			'user_id': null,
			'screen_name': null
		}
	},
	'settings' : {
		'loaded': false,
		'hidemysearch': false,
		'units': 'metric',
		'detectunits': true,
		'cachetype': cacheIDs['all'],
		'defaultnavigation': 'builtin',
		'autoclean': true,
		'recalculatedistance': false,
		'theme': 'palm-default',
		'logcount': 20,
		'minimalaccuracy': 34,
		'version': 0,
		'firstTimeout': 12,
		'secondTimeout': 45,
		'compassInNewCard': false,
		'magneticcompass': false,
		'tutorials': {
			'mappingtool': false,
			'compass': false
		},
		'go4cache': false,
		'debug': true
	},
	'storage': null,
	'db': null, 
	'lastAjaxId': null,
	'lastActiveMap': null,
	'ajaxRequests': {}
}

Geocaching.saveSettings = function()
{
	try {
		Geocaching.storage.simpleAdd('preferences', Geocaching.settings,
			function() {}.bind(this),
			function() {}.bind(this)
		);
	} catch(e) { }
}

Geocaching.searchAddress = function(address, success, failure)
{
	var url = "http://maps.google.com/maps/geo?ouptut=json&oe=utf-8&q="+encodeURIComponent(address);
	var checkAjax = new Ajax.Request(url, {
		'method': 'get',
		'evalJSON': 'force',
		'onSuccess': function(r){
			if(typeof(r.responseJSON) != 'object') {
				failure($L("Error occured on address search."));
				return false;
			}
			if(r.responseJSON['Status']['code'] != 200 || r.responseJSON['Placemark'].length < 1) {
				failure($L("No address found."));
				return false;
			}
			var addresses = new Array();
			var len = r.responseJSON['Placemark'].length; var address = {};
			for(var z=0; z<len; z++) {
				address = {
					'address': r.responseJSON['Placemark'][z]['address'],
					'latitude': r.responseJSON['Placemark'][z]['Point']['coordinates'][1],
					'longitude': r.responseJSON['Placemark'][z]['Point']['coordinates'][0]
				};
				addresses.push(Object.clone(address));
			}
			success(addresses);
		},
		onFailure: function(r){
			failure($L("Error occured on address search."));
		}
	});
}

Geocaching.format4Maptool = function(waypoints) {
	var items = new Array();
	var len = waypoints.length;
	var _waypoint;
	var item = {};
	for(var z=0; z<len; z++) {
		_waypoint = waypoints[z];
		item = {
			'lat': _waypoint['latitude'],
			'lon': _waypoint['longitude'],
			'name': _waypoint['title'],
			'image': 'http://www.geocaching.com/images/wpttypes/sm/waypoint.jpg'
		};
		switch(_waypoint['wptType'])
		{
			case 'cache':
				item['image'] = 'http://www.geocaching.com/images/WptTypes/sm/'+cacheTypesIDs[_waypoint['type']]+'.gif';
			break;
			case 'waypoint':
				item['image'] = 'http://www.geocaching.com/images/wpttypes/sm/'+_waypoint['type']+'.jpg';
			break;
		}
		items.push(Object.clone(item));
	}
	return items;
}

Geocaching.getDistance = function(lat1, lon1, lat2, lon2)
{
	lat1 *= deg2rad;
	lon1 *= deg2rad;
	lat2 *= deg2rad;
	lon2 *= deg2rad;

	var d = Math.sin(lat1)*Math.sin(lat2) + Math.cos(lat1)*Math.cos(lat2)*Math.cos(lon1-lon2);
	return erad * Math.acos(d); // Return distance in KM
}

Geocaching.getAzimuth = function(lat1, lon1, lat2, lon2)
{
	var result = 0.0;

	var ilat1 = parseInt(0.5 + lat1 * 360000);
	var ilon1 = parseInt(0.5 + lon1 * 360000);
	var ilat2 = parseInt(0.5 + lat2 * 360000);
	var ilon2 = parseInt(0.5 + lon2 * 360000);

	lat1 *= deg2rad;
	lon1 *= deg2rad;
	lat2 *= deg2rad;
	lon2 *= deg2rad;

	if(ilat1 == ilat2 && ilon1 == ilon2) {
		return result;
	} else
	if(ilat1 == ilat2) {
		if(ilon1 > ilon2) {
			result = 90.0;
		} else {
			result = 270.0;
		}
	} else
	if(ilon1 == ilon2) {
		if(ilat1 > ilat2) {
			result = 180.0;
		}
	} else {
		var c = Math.acos(Math.sin(lat2)*Math.sin(lat1) + Math.cos(lat2)*Math.cos(lat1)*Math.cos((lon2-lon1)));
		var A = Math.asin(Math.cos(lat2)*Math.sin((lon2-lon1))/Math.sin(c));
		result = (A * rad2deg);
		if(ilat2 > ilat1 && ilon2 > ilon1) {
			result = result;
		} else
		if (ilat2 < ilat1 && ilon2 < ilon1) {
			result = 180.0 - result;
		} else
		if (ilat2 < ilat1 && ilon2 > ilon1) {
			result = 180.0 - result;
		} else
		if (ilat2 > ilat1 && ilon2 < ilon1) {
			result += 360.0;
		}
	}
	return result;
};

Geocaching.getSimpleAzimuth = function(azimuth) {
	var direction = 'N';
	if(azimuth > 338 || azimuth < 22) {
		direction = 'N';
	} else
	if(azimuth >= 22 && azimuth < 67) {
		direction = 'NE';
	} else 
	if(azimuth >= 76  && azimuth < 112) {
		direction = 'E';
	} else 
	if(azimuth >= 112  && azimuth < 157) {
		direction = 'SE';
	} else 
	if(azimuth >= 157  && azimuth < 202) {
		direction = 'S';
	} else 
	if(azimuth >= 202  && azimuth < 247) {
		direction = 'SW';
	} else 
	if(azimuth >= 247  && azimuth < 292) {
		direction = 'W';
	} else {
		direction = 'NW';
	}
	return direction;
}

Geocaching.getHumanDistance = function(distance) {
	if(Geocaching.settings['units'] == 'imperial') {
		distance *= kmInMiles;
		if(distance > 10) {
			return Math.round(distance) +" mi";
		} else
		if(distance > 0.8) {
			return Math.round(distance,1) +" mi";
		} else
		if(distance > 0.1) {
			return Math.round(distance*ft2miles) +" ft";
		} else
		if(distance > 0.05) {
			return (Math.round(distance*ft2miles*10)/10) +" ft";
		} else {
			return (Math.round(distance*ft2miles*100)/100) +" ft";
		}
	} else {
		if(distance > 10) {
			return Math.round(distance) +" km";
		} else
		if(distance > 1) {
			return Math.round(distance,1) +" km";
		} else
		if(distance > 0.1) {
			return Math.round(distance*1000) +" m";
		} else
		if(distance > 0.05) {
			return (Math.round(distance*1000*10)/10) +" m";
		} else {
			return (Math.round(distance*1000*100)/100) +" m";
		}
	}
}

Geocaching.getHumanSpeed = function(speed) {
	var kph = speed * 3.6;
	var unit = "kmh";
	if(Geocaching.settings['units'] == 'imperial') {
		kph *= kmInMiles;
		unit = "mph";
	}

	if(kph < 10) {
		return (Math.round(kph*10)/10) +" "+ unit;
	} else {
		return Math.round(kph) +" "+ unit;
	}
}

Geocaching.parseLatLon = function(latlon) {
	var tmp = ''; var result = {};
	latlon = new String(latlon);
	if(tmp = latlon.match(/^([NS]) (\d+)° (\d+)\.(\d+) ([WE]) (\d+)° (\d+)\.(\d+)$/i)) {
		result['latitude'] = (tmp[1] == 'N'  ? 1 : -1 ) * ( Number(tmp[2])  + (tmp[3]+"."+tmp[4])/60 );
		result['longitude'] = (tmp[5] == 'E'  ? 1 : -1 ) * ( Number(tmp[6])  + (tmp[7]+"."+tmp[8])/60 );
		return result;
	} else {
		return false;
	}
}

Geocaching.parseCoordinate = function(coord) {
	var tmp = ''; var result = 0;
	coord = new String(coord);
	coord = coord.toUpperCase();
	if(tmp = coord.match(/^([NSWE])\s*(\d+)[°]?\s*(\d+)\.(\d+)$/i)) {
		result = (tmp[1] == 'N' || tmp[1] == 'E' ? 1 : -1 ) * ( Number(tmp[2])  + (tmp[3]+"."+tmp[4])/60 );
		return result;
	} else
	if(tmp = coord.match(/^([NSWE])\s*(\d+)\.(\d+)$/i)) {
		result = (tmp[1] == 'N' || tmp[1] == 'E' ? 1 : -1 ) * Number(tmp[2]+"."+tmp[3]);
	} else
	if(tmp = coord.match(/^([+-])?(\d+)\.(\d+)$/i)) {
		if(typeof(tmp[1]) == 'undefined')
			tmp[1] = "+";
		result = Number(tmp[1]+"1") * Number(tmp[2]+"."+tmp[3]);
	} else
	if(tmp = coord.match(/^([NSWE])\s*(\d+)[°]?$/i)) {
		result =  (tmp[1] == 'N' || tmp[1] == 'E' ? 1 : -1 ) * Number(tmp[2]);
	} else
	if(tmp = coord.match(/^([+-])?(\d+)[°]?$/i)) {
		if(typeof(tmp[1]) == 'undefined')
			tmp[1] = "+";
		result = Number(tmp[1]+"1") * Number(tmp[2]);
	} else
	if(tmp = coord.match(/^([NSWE])\s*(\d+)[°]?\s*(\d+)$/i)) {
		result = (tmp[1] == 'N' || tmp[1] == 'E' ? 1 : -1 ) * (Number(tmp[2])+Number(tmp[3])/60);
	} else {
		return false;
	}
	return result;
}

Geocaching.toLatLon = function (coord,latlon) {
	var tmp='';var result='';
	if(tmp = new String(Number(coord).toFixed(9)).match(/^(-)?(\d+)\.(\d+)$/i)) {
		if(typeof(tmp[1]) == 'undefined')
			tmp[1] = "+";

		var tmpCord = Number("0."+tmp[3]);

		if(latlon == 'lat') {
			if(tmp[1] == "+") tmp[1] = "N ";
			if(tmp[1] == "-") tmp[1] = "S ";
		} else
		if(latlon == 'lon') {
			if(tmp[1] == "+") tmp[1] = "E ";
			if(tmp[1] == "-") tmp[1] = "W ";
		}
		result = tmp[1] + tmp[2] +"° "+(tmpCord/(1/60)).toFixed(3);
		delete(tmpCord);
		
		return result;
	} else {
		return false;
	}

}

Geocaching.simpleProjection = function(srclat,srclon,angle,distance,unit) {
	var result = {};
	var dist;
	switch (unit) {
	 	case 0:	dist = distance/1000;
			break;
		case 1: dist = distance/kmInMiles/ft2miles;
			break;
		case 2: dist = distance/kmInMiles/ft2miles*ft2yards;
			break;
		case 3: dist = distance/kmInMiles;
			break;
	}
	result['lat']=srclat+(dist*180/Math.PI/erad)*Math.cos(deg2rad*angle);
	result['lon']=srclon+(dist*180/Math.PI/erad)*Math.sin(deg2rad*angle)/Math.cos(deg2rad*result['lat']);
	return result;
}

Geocaching.parseFile = function(filename, success, failure)
{
	var ajaxId = 'localfile';
	if(filename.match(/\.loc$/i)) {
		Geocaching.ajaxRequests[ajaxId] = new Ajax.Request(filename, {
			'method': 'get',
			'onSuccess': function(r){
				var _caches = new Array();
				var wpts = r.responseXML.getElementsByTagName('waypoint');
				var wptsLen = wpts.length;
				var wpt;
				var _cache = {};
				var ts = Math.round(new Date().getTime() / 1000);
				for(var z=0; z<wptsLen; z++) {
					_cache = {};
					try {
						wpt = wpts[z];
						_cache['latitude'] = wpt.getElementsByTagName('coord')[0].getAttribute('lat');
						_cache['longitude'] = wpt.getElementsByTagName('coord')[0].getAttribute('lon');
						_cache['geocode'] = wpt.getElementsByTagName('name')[0].getAttribute('id');
						_cache['name'] = wpt.getElementsByTagName('name')[0].textContent;
						_cache['found'] = false;
						_cache['own'] = false;
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
						_caches.push(Object.clone(_cache));
					} catch(e) { }
				}
				success(_caches);	
			},
			'onFailure': function(r){
				failure($L("Error occured on reading GPX file."));
			}
		});
	} else
	if(filename.match(/\.gpx$/i)) {
		Geocaching.ajaxRequests[ajaxId] = new Ajax.Request(filename, {
			'method': 'get',
			'onSuccess': function(r){
				var _caches = new Array();
				var wpts = r.responseXML.getElementsByTagName('wpt');
				var wptsLen = wpts.length;
				var wpt;
				var _cache = {}, _log = {};
				var wptCache, tmp, logs, logsLen, i, d;
				var ts = Math.round(new Date().getTime() / 1000);
				for(var z=0; z<wptsLen; z++) {
					_cache = {};
					try {
						wpt = wpts[z];
						_cache['latitude'] = wpt.getAttribute('lat');
						_cache['longitude'] = wpt.getAttribute('lon');
						_cache['geocode'] = wpt.getElementsByTagName('name')[0].textContent;
						_cache['found'] = (wpt.getElementsByTagName('sym')[0].textContent.match(/Found/i));
						wptCache = wpt.getElementsByTagName('cache')[0];
						_cache['archived'] = (wptCache.getAttribute('archived') == "True");
						_cache['disabled'] = (!_cache['archived'] && wptCache.getAttribute('available') == "False");
						_cache['cacheid'] = wptCache.getAttribute('id');
						_cache['name'] = wptCache.getElementsByTagName('name')[0].textContent;
						_cache['shortdesc']= wptCache.getElementsByTagName('short_description')[0].textContent;
						_cache['description'] = wptCache.getElementsByTagName('long_description')[0].textContent;
						_cache['difficulty'] = wptCache.getElementsByTagName('difficulty')[0].textContent;
						_cache['terrain'] = wptCache.getElementsByTagName('terrain')[0].textContent;
						_cache['size'] = wptCache.getElementsByTagName('container')[0].textContent;
						_cache['type'] = wptCache.getElementsByTagName('type')[0].textContent;
						_cache['hint'] = wptCache.getElementsByTagName('encoded_hints')[0].textContent;
						_cache['owner'] = wptCache.getElementsByTagName('owner')[0].textContent;
						_cache['location'] = (wptCache.getElementsByTagName('state')[0].textContent ? wptCache.getElementsByTagName('state')[0].textContent + ", " : "");
						_cache['location'] += wptCache.getElementsByTagName('country')[0].textContent;
						_cache['favourite'] = true;
						_cache['needsmaint'] = false;
						_cache['members'] = false;

						_cache['updated'] = ts;
						_cache['waypoints'] = [];
						_cache['logs'] = [];

						try {
							tmp = wptCache.getElementsByTagName('logs')[0];
							logs = tmp.getElementsByTagName('log');
							logsLen = logs.length;
							_log = {};
							for(i=0; i<logsLen; i++) {
								_log['author'] = logs[i].getElementsByTagName('finder')[0].textContent;
								try {
									d = logs[i].getElementsByTagName('date')[0].textContent.match(/^(\d+)\-(\d+)-(\d+)T(\d+):(\d+):(\d+)Z?$/);
									_log['date'] = Mojo.Format.formatDate(new Date(d[1], d[2], d[3], d[4], d[5], d[6]), {'date':'medium', 'time':''});
								} catch(e) {
									_log['date'] = '';
								}
								_log['body'] = logs[i].getElementsByTagName('text')[0].textContent;
								_log['founds'] = '-';
								switch(logs[i].getElementsByTagName('type')[0].textContent)
								{
									case 'Found it':
										_log['icon'] = 'found';
									break;
									case 'Didn\'t find it':
										_log['icon'] = 'notfound';
									break;
									case 'Published':
										_log['icon'] = 'published';
									break;
									case 'Needs maintenance':
										_log['icon'] = 'needsmaint';
									break;
									case 'Maintenance':
										_log['icon'] = 'maint';
									break;
									case 'Temporarily Disable Listing':
										_log['icon'] = 'disabled';
									break;
									case 'Enabled':
										_log['icon'] = 'enabled';
									break;
									case 'Coordinates update':
										_log['icon'] = 'coordslog';
									break;
									case 'Reviewer note':
										_log['icon'] = 'reviewernote';
									break;
									case 'traffic_cone':
										_log['icon'] = 'archive';
									break;
									case 'Write Note':
									default:
										_log['icon'] = 'note';
									break;
								}
								_cache['logs'].push(Object.clone(_log));
							}
						} catch(e) { }

						_cache['spoilerImages'] = [];
						_cache['galleryImagesCount'] = 0;
						_cache['galleryImages'] = [];
						
						
						_cache['guid'] = '';
						try {
							if(tmp = wpt.getElementsByTagName('url')[0].textContent.match(/guid=(.*)$/i)) {
								_cache['guid'] = tmp[1];
							}
						} catch(e) { }
						if(_cache['guid'] == '') {
							try {
								if(tmp = wpt.getElementsByTagName('url')[0].getAttribute('href').match(/guid=(.*)$/i)) {
									_cache['guid'] = tmp[1];
								}
							}catch(e) { }
						}

						_caches.push(Object.clone(_cache));
					} catch(e) { 
						Mojo.Log.error(Object.toJSON(e));
					}
				}
				success(_caches);
			},
			'onFailure': function(r){
				failure($L("Error occured on reading GPX file."));
			}
		});
	} else {
		failure($L("Unknown file format."));
	}
}

Geocaching.decodeText = function(string)
{
	//  ROT13 decoding string.
	var xlr13 = 'abcdefghijklmnopqrstuvwxyzabcdefghijklm' +
				'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLM'

	//  Plaintext flag.
	var pt = false;
	var len = string.length;
	var decoded = '';
	for (var z = 0; z < len; z++) {
		var c = string.charAt(z);
		if (c == '[') {
			pt = true;
		} else if (c == ']') {
			pt = false;
		} else {
			var idx = xlr13.indexOf(c);
			if (idx >= 0 && !pt) {
				c = xlr13.charAt(idx + 13);
			}
		}
		decoded += c;
	}
	return decoded;
}

/**
  * Function to send exception report to developer
  *
  * @description Very simple function to send report to website
  *
  * @param String operation - Actual operation
  * @param String reply - HTML reply
  * @param Object exception - Raised exception
  * @return None
  */
Geocaching.sendReport = function(operation, reply, exception)
{
	if(Geocaching.settings['debug']) {
		var url = 'http://gcgogo.yz.to/report.php';
		var parameters = {
			'o': operation,
			'r': reply,
			'e': Object.toJSON(exception),
			'w': Object.toJSON(Mojo.Environment.DeviceInfo),
			'a': Mojo.Controller.appInfo.id,
			'v': Mojo.Controller.appInfo.version
		};
		var request = new Ajax.Request(url, {
			'method': 'post',
			'parameters': parameters,
			'contentType': 'application/x-www-form-urlencoded',
			'onSuccess': function(r){
				Mojo.Log.error(r.responseText);
				return true;
			}.bind(this),
			'onFailure': function(r){
				return false;
			},
			'onException': function(r){
				return false;
			}
		});
		return true;
	} else {
		return false;
	}
};

String.prototype.trim = function()
{
	return this.replace(/^\s+|\s+$/g, '');
}

String.prototype.stripTags = function()
{
	return this.replace(/<\/?[^>]+>/gi, '');
}
