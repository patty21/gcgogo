Go4Cache  = function() {
	this.lastTs = 0;
	this.lastLatitude = null;
	this.lastLongitude = null;
};

Go4Cache.prototype.sendLocation = function(latitude, longitude, action) {
	var url = 'http://api.go4cache.com/';
	var ts = Math.round(new Date().getTime() / 1000);
	var distance = 0;
	
	if(this.lastLatitude != null) {
		distance = Geocaching.getDistance(latitude, longitude, this.lastLatitude, this.lastLongitude);
	}
	
	// Share location only once per 3 minutes or when distance from last known position was >750m
	if(ts < this.lastTs + (3*60) || distance > 0.750) {
		return false;
	}
	
	this.lastLatitude = latitude;
	this.lastLongitude = longitude;
	
	var ajaxId = 'go4cache-'+ ts;
	var parameters = {
		'lt': latitude,
		'ln': longitude,
		'a': action,
		'm': 1
	};
	
	// Sign request
	parameters = this.signRequest(parameters);
	
	Geocaching.ajaxRequests[ajaxId] = new Ajax.Request(url, {
		'method': 'post',
		'parameters': parameters,
		'onSuccess': function(r){
			Geocaching.lastAjaxId = null;
			delete(Geocaching.ajaxRequests[ajaxId]);

			this.lastTs = Math.round(new Date().getTime() / 1000);
		}.bind(this),
		'onFailure': function(r){
			// None
		}
	});
};

Go4Cache.prototype.getCachers = function(params, success) {
	var url = 'http://api.go4cache.com/get.php';
	var ts = Math.round(new Date().getTime() / 1000);
	
	var ajaxId = 'go4cache-'+ ts;
	
	var parameters = {
		'ltm': params['lat1'],
		'ltx': params['lat2'],
		'lnm': params['lon1'],
		'lnx': params['lon2']
	};
	
	// Sign request
	parameters = this.signRequest(parameters);
	
	Geocaching.ajaxRequests[ajaxId] = new Ajax.Request(url, {
		'method': 'post',
		'parameters': parameters,
		'evalJSON': 'force',
		'onSuccess': function(r){
			Geocaching.lastAjaxId = null;
			delete(Geocaching.ajaxRequests[ajaxId]);
		
			var reply = r.responseJSON;
			success(reply['users']);
		}.bind(this),
		'onFailure': function(r){
			// None
		}
	});
};


Go4Cache.prototype.signRequest = function(params) {
	params['u'] = Geocaching.login['username'];

	// Sign is encrypted - This function is in Georgo's head <tomas@kopecny.info>
	var _0xe910 = ["\x74\x6F\x4C\x6F\x77\x65\x72\x43\x61\x73\x65","\x75","\x6C\x74","\x6C\x6E","\x61","\x30\x61\x63\x33\x72\x36"];
	var sign = new String(hex_sha1(params[_0xe910[1]]+params[_0xe910[2]]+params[_0xe910[3]]+params[_0xe910[4]]+hex_md5(_0xe910[5])))[_0xe910[0]]();
	params['s'] = sign;

	return params;
}