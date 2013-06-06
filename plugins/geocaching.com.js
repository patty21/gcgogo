GeocachingCom  = function() {
}

GeocachingCom.prototype.doLogin = function(username, password, success, failure)
{
	/* Load login page to check inputs */
	var url = "http://www.geocaching.com/login/default.aspx?RESET=Y";
	var checkAjax = new Ajax.Request(url, {
		'method': 'get',
		'onSuccess': function(r){
			var reply = r.responseText;
			var viewstate = reply.match(/id="__VIEWSTATE"\s+value="([^"]+)"/)[1]
			var posturl = 'http://www.geocaching.com/login/default.aspx?RESETCOMPLETE=Y';
			var postdata = {
				'__EVENTTARGET': "",
				'__EVENTARGUMENT': "",
				'__VIEWSTATE': viewstate,
				'ctl00$ContentBody$tbUsername': username,
				'ctl00$ContentBody$tbPassword': password,
				'ctl00_ContentBody_cbRememberMe': "on",
				'ctl00$ContentBody$btnSignIn': "Login",
			};

			try {
				var eventvalidation = reply.match(/id="__EVENTVALIDATION"\s+value="([^"]+)"/)[1]
				postdata['__EVENTVALIDATION'] = eventvalidation;
			} catch(e) { /* None */ }
			
			var loginAjax = new Ajax.Request(posturl, {
				'method': 'post',
				'parameters': postdata,
				'contentType': 'application/x-www-form-urlencoded',
				'onSuccess': function(r){
					var reply = r.responseText;
					if(!this.checkLogin(reply)) {
						failure($L("Incorrect username or password!"));
						return false;
					}
/*
					// Switch to English
					var viewstate = reply.match(/id="__VIEWSTATE"\s+value="(.+?)"/)[1]
					var posturl = 'http://www.geocaching.com/login/default.aspx';
					var parameters = {
						'__EVENTTARGET': 'ctl00$uxLocaleList$uxLocaleList$ctl00$uxLocaleItem',
						'__EVENTARGUMENT': '',
						'__VIEWSTATE' : viewstate
					};
					var englishAjax = new Ajax.Request(posturl, {
						'method': 'post',
						'parameters': parameters,
						'contentType': 'application/x-www-form-urlencoded',
					});
*/
					success();
					return true;
				}.bind(this)
			});
		}.bind(this),
		onFailure: function(r){
			failure($L("Error occured on loging in."));
		}
	});
}

GeocachingCom.prototype.getUID = function(success)
{
	Mojo.Log.info('Getting UID');
	var url = "http://www.geocaching.com/my/default.aspx";
	var userpageAjax = new Ajax.Request(url, {
		'method': 'get',
		'onSuccess': function(r){
			var reply = r.responseText;
			try {
			var uid = reply.match(/(http:\/\/([\-0-9\.a-z\/]*)?www\.geocaching\.com)?\/profile\/\?guid=([a-z0-9\-]+)/i)[3]
			var geid = reply.match(/googleearthutils\.svc\/kml\/(\w+)\/create/i)[1];
			geid+= reply.match(/id="memberStatus">\s*(\w)\w+ Member<br \/>/i)[1];
			} catch (e) {
				Mojo.Log.error('UID-e:'+Object.toJSON(e));
			}
			success(uid,geid);
		}.bind(this),
		'onFailure': function(r){
			Mojo.Log.error('Fail!');
		}
	});
};

GeocachingCom.prototype.checkLogin = function(page)
{
	if(-1 != page.search('<a href="/my/default.aspx"')) {
		return true;
	}
	if(-1 != page.search('href="../my/default.aspx">')) {
		return true;
	}
	return false;
}

GeocachingCom.prototype.parseSearch = function(url, reply, list)
{
	var viewstate = new Array();
	var viewstate0, viewstate1, viewstate2, viewstate3, eventvalidation0;
	var pageleft = 0;
	try {
		eventvalidation0 = reply.match(/id="__EVENTVALIDATION" value="([^"]+)"/)[1]
		viewstate.push(eventvalidation0);
	} catch(e) {
		viewstate.push(false);
	}
	
	try {
		viewstate0 = reply.match(/id="__VIEWSTATE" value="([^"]+)"/)[1]
		viewstate.push(viewstate0);
	} catch(e) { }

	try {
		viewstate1 = reply.match(/id="__VIEWSTATE1" value="([^"]+)"/)[1]
		viewstate.push(viewstate1);
	} catch(e) { }
	
	try {
		viewstate2 = reply.match(/id="__VIEWSTATE2" value="([^"]+)"/)[1]
		viewstate.push(viewstate2);
	} catch(e) { }

	try {
		viewstate3 = reply.match(/id="__VIEWSTATE3" value="([^"]+)"/)[1]
		viewstate.push(viewstate3);
	} catch(e) { }
	
	try {
		var tmp = reply.match(/<td class="PageBuilderWidget"><span>[^<]+<b>[^<]+<\/b>[^<]+<b>(\d+)<\/b>[^<]+<b>(\d+)<\/b>/);
		pageleft = tmp[2]-tmp[1];
	} catch(e) { }

	var startPos = reply.indexOf('<table class="SearchResultsTable Table">');
	if(startPos == -1)
		return false;

	var r = reply.substr(startPos); // Cut on <table
	
	startPos = r.indexOf('>');
	var endPos = r.indexOf('ctl00_ContentBody_UnitTxt');
	if(startPos == -1 || endPos == -1)
		return false;

	r = r.substr(startPos+1, endPos-startPos+1); // Cut between <table> and </table>

	var rows = r.split("</tr>");
	var rows_count = rows.length;
	if (list == null) {list = new Array();}

	for(var z=1; z<rows_count; z++) { try {
		var row = rows[z];
		var listRow = {}
		var tmp;
		// Check for Cache type presence
		if(row.indexOf('images/wpttypes/') == -1) {
			continue;
		}

		// Cache type
		listRow['type'] = row.match(/<img src="(http:\/\/([\-0-9\.a-z\/]*)?www\.geocaching\.com)?\/images\/wpttypes\/[^.]+\.gif" alt="([^"]+)" title="([^"]+)" class="SearchResultsWptType"/i)[3]
		
		// Direction and distance (not in all lists)
		try {
			tmp = row.match(/>([SWEN]+)<br[^>]*>([0-9\.a-z]+)/i);
			listRow['direction'] = tmp[1];
			listRow['distance'] = tmp[2];
		} catch(e) {
			// Possibly is Here or distance is not present
		}
		
		//try {
		//	listRow['ddattr'] = row.match(/\/ImgGen\/seek\/CacheDir\.ashx\?k=([a-z0-9%]+)/i)[1]
		//} catch(e) { }

	
		// Cache attributes
		try {
			listRow['attribs'] = row.match(/>([0-9.]+\/[0-9.]+)</)[1]
		} catch(e) { }

		// Cache size
		try {
			tmp = row.match(/<img src="\/images\/icons\/container\/([a-z_]+)\.gif" alt/i);
			listRow['size'] = cacheSizeNo[tmp[1]];
		} catch(e) {
			listRow['size'] = 'none';
		}

		// try {
		//	listRow['gsattr'] = row.match(/\/ImgGen\/seek\/CacheInfo\.ashx\?v=([a-z0-9]+)/i)[1]
		//} catch(e) { }

		// GUID and disabled
		try {
			tmp = row.match(/guid=([a-z0-9\-]+)" class="lnk([^"]*)"><span>([^<]*)<\/span>/i);
			listRow['guid'] = tmp[1];
			listRow['name'] = tmp[3];
			if(tmp[2].indexOf("Warning") != -1 && tmp[2].indexOf("Strike") != -1) {
				listRow['archived'] = true;
			} else {
				listRow['archived'] = false;
			}
			if(tmp[2].indexOf("Strike") != -1) {
				listRow['disabled'] = true;
			} else {
				listRow['disabled'] = false;
			}
			if(tmp[2].indexOf("OldWarning") != -1 && tmp[2].indexOf("Strike") != -1) {
				listRow['archived'] = true;
			} else {
				listRow['archived'] = false;
			}

		} catch(e) {
			Mojo.error(Object.toJSON(e));
		}

		if(row.indexOf('images/icons/16/premium_only.png') != -1)
			listRow['members'] = true;
		else
			listRow['members'] = false;


		if(row.indexOf('/images/icons/16/maintenance.png') != -1)
			listRow['maintenance'] = true;
		else
			listRow['maintenance'] = false;

		
		listRow['gccode'] = row.match(/\|\s+(GC[A-Z0-9]+)/)[1]
		
		// Found it flag!
		if(row.indexOf('images/icons/16/found.png') != -1) {
			row = row.replace('images/icons/icon_smile.png', '');
			listRow['found'] = true;
		} else { 
			listRow['found'] = false;
		}

		// Own flag!
		if(row.indexOf('images/icons/16/placed.png') != -1) {
			row = row.replace('images/icons/16/placed.png', '');
			listRow['own'] = true;
		} else { 
			listRow['own'] = false;
		}

		// Trackables
		listRow['trackables'] = new Array();
		try {
			tmp = row.match(/<img src="(http:\/\/([\-0-9\.a-z\/]*)?www\.geocaching\.com)?\/images\/wpttypes\/([^.]+)\.gif"/ig);
			// First one is cache type
			if(tmp.length>1) {
				var len = tmp.length, trkTmp;
				for(var i=1; i<len; i++) {
					trkTmp = tmp[i].match(/<img src="(http:\/\/([\-0-9\.a-z\/]*)?www\.geocaching\.com)?\/images\/wpttypes\/([^.]+)\.gif"/i);
					listRow['trackables'].push(trkTmp[2]);
				}
				delete(trkTmp); delete(len);
			}
		} catch(e) {
			Mojo.Log.error(Object.toJSON(e));
		}
		if(row.indexOf('/images/icons/16/trackable_inventory.png') != -1) {
			listRow['trackables'].push('1');
		}
		try {
			listRow['cacheid'] = row.match(/name="CID" value="(\d+)"/i)[1]
		} catch(e) {
		}
		
		list.push(listRow);
	} catch(e) {
		Mojo.Log.error(Object.toJSON(e));
		if(Geocaching.sendReport('parseSearch_'+url, reply, e)) {
			break;
		}
	} };

	if(list.length == 0)
		return false;

	var searchResult = {
		'url': url,
		'viewstate': viewstate,
		'cacheList': list,
		'pageleft' : pageleft
	}

	return searchResult;
}

GeocachingCom.prototype.urlParams = function() {
	var url = "";
	if(Geocaching.settings['hidemysearch']) {
		url += '&f=1';
	}
	return url;
}

GeocachingCom.prototype.downloadLoc = function(cids, success)
{
	var url = 'http://www.geocaching.com/seek/nearest.aspx?';
	var ajaxId = 'loc-'+ Math.round(new Date().getTime());

	var parameters = new Array();
	var len = cids.length;
	for(var z=0;z<len; z++) {
		parameters.push('CID='+cids[z]);
	}
	Geocaching.ajaxRequests[ajaxId] = new Ajax.Request(url, {
		'method': 'post',
		'parameters': parameters.join('&')+'&Download=Download+Waypoints',
		'contentType': 'application/x-www-form-urlencoded',
		'onSuccess': function(r){
			var reply = r.responseText;
			var waypoints = {};
			var responseXML = (new DOMParser()).parseFromString(reply, "text/xml");
			var wpts = responseXML.getElementsByTagName('waypoint');
			var wptsLen = wpts.length, wpt, _gccode, _latitude, _longitude;
			for(var z=0; z<wptsLen; z++) {
				try {
					wpt = wpts[z];
					_latitude = wpt.getElementsByTagName('coord')[0].getAttribute('lat');
					_longitude = wpt.getElementsByTagName('coord')[0].getAttribute('lon');
					_gccode = wpt.getElementsByTagName('name')[0].getAttribute('id');
					waypoints[_gccode] = {
						'lat': _latitude,
						'lon': _longitude
					}
				} catch(e) {
					Mojo.Log.error('Error in LOC file parsing', e);
				}
			}
			success(waypoints);
		}.bind(this)
	});
}

GeocachingCom.prototype.searchByUrlNextPage = function(params, success, failure)
{
	var url = params['url'];
	var list = params['list'];
	var viewstate = params['viewstate'];
	var viewstate_len = viewstate.length;
	var timeout = Geocaching.settings['firstTimeout'];
	if(typeof(params['retry']) != 'undefined' && params['retry']>1) {
		var timeout = Geocaching.settings['secondTimeout'];
	} else {
		params['retry'] = 1;
	}

	var parameters = {
		'__VIEWSTATE' : viewstate[1],
		'__EVENTTARGET': 'ctl00$ContentBody$pgrBottom$ctl08',
		'__EVENTARGUMENT': ''
	}
	
	if(viewstate[0] !== false) {
		parameters['__EVENTVALIDATION'] = viewstate[0];
	}
	
	if(viewstate_len > 2) {
			for(var i=2; i<viewstate_len; i++) {
				parameters['__VIEWSTATE'+(i-1)] = viewstate[i]
			}
			parameters['__VIEWSTATEFIELDCOUNT'] = viewstate_len-1;
	}

	var ajaxId = 'nextpage-'+ viewstate[1].substr(0,16) +'-'+ Math.round(new Date().getTime());
	Geocaching.ajaxRequests[ajaxId] = new Ajax.Request(url, {
		'method': 'post',
		'parameters': parameters,
		'contentType': 'application/x-www-form-urlencoded',
		'onSuccess': function(r){
			var reply = r.responseText;
			if(!this.checkLogin(reply)) {
				this.doLogin(
					Geocaching.login['username'],
					Geocaching.login['password'], 
					function() {
						this.searchByUrlNextPage(params, success, failure);
					}.bind(this),
					failure
				);
				return false;
			}
			list = this.parseSearch(url, reply, list);
			if(list == false) {
				failure($L("No more caches found."));
			} else {
				success(list);
			}
		}.bind(this),
		'onFailure': function(r){
			Mojo.Log.error(Object.toJSON(r));
			failure($L("Error occured on fetching list."));
		}
	});
	Geocaching.lastAjaxId = ajaxId;

	window.setTimeout(function(ajaxId, params, success, failure) {
		if(Ajax.activeRequestCount > 0 && ajaxId == Geocaching.lastAjaxId) {
			Geocaching.ajaxRequests[ajaxId].abort();
			delete(Geocaching.ajaxRequests[ajaxId]);

			if(params['retry']>1) {
				failure($L("Operation timeout"));
			} else {
				Mojo.Controller.getAppController().showBanner({messageText: $L("Getting cache list failed, retrying ...")}, '', 'cachelist');
				params['retry']++;
				this.searchByUrlNextPage(params, success, failure);
			}
		}
	}.bind(this), timeout*1000, ajaxId, params, success, failure);
}

GeocachingCom.prototype.searchByKeyword = function(params, success, failure)
{
	var keyword = params['keyword'];
	var cachetype = params['cachetype'];
	var timeout = Geocaching.settings['firstTimeout'];
	if(typeof(params['retry']) != 'undefined' && params['retry']>1) {
		var timeout = Geocaching.settings['secondTimeout'];
	} else {
		params['retry'] = 1;
	}

	var url = "http://www.geocaching.com/seek/nearest.aspx?tx="+ encodeURIComponent(cachetype) +"&key="+ encodeURIComponent(keyword) + this.urlParams();
	var ajaxId = 'keyword-'+ keyword +'-'+ Math.round(new Date().getTime());

	Geocaching.ajaxRequests[ajaxId] = new Ajax.Request(url, {
		'method': 'get',
		'onSuccess': function(r){
			Geocaching.lastAjaxId = null;
			delete(Geocaching.ajaxRequests[ajaxId]);

			var reply = r.responseText;
			if(!this.checkLogin(reply)) {
				this.doLogin(
					Geocaching.login['username'],
					Geocaching.login['password'], 
					function() {
						this.searchByKeyword(params, success, failure)
					}.bind(this),
					failure
				);
				return false;
			}
			var list = this.parseSearch(url, reply);
			if(list == false) {
				failure($L("No caches found."));
			} else {
				success(list);
			}
		}.bind(this),
		'onFailure': function(r){
			Mojo.Log.error(Object.toJSON(r));
			failure($L("Error occured on fetching list."));
		}
	});
	Geocaching.lastAjaxId = ajaxId;

	window.setTimeout(function(ajaxId, params, success, failure) {
		if(Ajax.activeRequestCount > 0 && ajaxId == Geocaching.lastAjaxId) {
			Geocaching.ajaxRequests[ajaxId].abort();
			delete(Geocaching.ajaxRequests[ajaxId]);

			if(params['retry']>1) {
				failure($L("Operation timeout"));
			} else {
				Mojo.Controller.getAppController().showBanner({messageText: $L("Getting cache list failed, retrying ...")}, '', 'cachelist');
				params['retry']++;
				this.searchByKeyword(params, success, failure);
			}
		}
	}.bind(this), timeout*1000, ajaxId, params, success, failure);
}

GeocachingCom.prototype.searchByCoords = function(params, success, failure)
{
	var latitude = params['latitude'];
	var longitude = params['longitude'];
	var cachetype = params['cachetype'];
	var timeout = Geocaching.settings['firstTimeout'];
	if(typeof(params['retry']) != 'undefined' && params['retry']>1) {
		var timeout = Geocaching.settings['secondTimeout'];
	} else {
		params['retry'] = 1;
	}

	var url = "http://www.geocaching.com/seek/nearest.aspx?tx="+ encodeURIComponent(cachetype) +"&origin_lat="+ encodeURIComponent(latitude) +"&origin_long="+ encodeURIComponent(longitude) + "&submit3=Search" + this.urlParams();
	var ajaxId = 'coords-'+ latitude +'-'+ longitude +'-'+ Math.round(new Date().getTime());

	Geocaching.ajaxRequests[ajaxId] = new Ajax.Request(url, {
		'method': 'get',
		'onSuccess': function(r){
			Geocaching.lastAjaxId = null;
			delete(Geocaching.ajaxRequests[ajaxId]);
			var reply = r.responseText;
			if(!this.checkLogin(reply)) {
				this.doLogin(
					Geocaching.login['username'],
					Geocaching.login['password'], 
					function() {
						this.searchByCoords(params, success, failure)
					}.bind(this),
					failure
				);
				return false;
			}
 			var list = this.parseSearch(url, reply);
			if(list == false) {
				failure($L("No caches found."));
			} else {
				success(list);
			}
		}.bind(this),
		'onFailure': function(r){
			failure($L("Error occured on fetching list."));
		}
	});
	Geocaching.lastAjaxId = ajaxId;
	window.setTimeout(function(ajaxId, params, success, failure) {
		if(Ajax.activeRequestCount > 0 && ajaxId == Geocaching.lastAjaxId) {
			Geocaching.ajaxRequests[ajaxId].abort();
			delete(Geocaching.ajaxRequests[ajaxId]);

			if(params['retry']>1) {
				failure($L("Operation timeout"));
			} else {
				Mojo.Controller.getAppController().showBanner({messageText: $L("Getting cache list failed, retrying ...")}, '', 'cachelist');
				params['retry']++;
				this.searchByCoords(params, success, failure);
			}
		}
	}.bind(this), timeout*1000, ajaxId, params, success, failure);
}

GeocachingCom.prototype.searchByUsername = function( params, success, failure)
{
	var username = params['username'];
	var cachetype = params['cachetype'];
	var timeout = Geocaching.settings['firstTimeout'];
	if(typeof(params['retry']) != 'undefined' && params['retry']>1) {
		var timeout = Geocaching.settings['secondTimeout'];
	} else {
		params['retry'] = 1;
	}

	var url = "http://www.geocaching.com/seek/nearest.aspx?tx="+ encodeURIComponent(cachetype) +"&ul="+ encodeURIComponent(username) + this.urlParams();
	var ajaxId = 'username-'+ username +'-'+ Math.round(new Date().getTime());

	Geocaching.ajaxRequests[ajaxId] = new Ajax.Request(url, {
		'method': 'get',
		'onSuccess': function(r){
			Geocaching.lastAjaxId = null;
			delete(Geocaching.ajaxRequests[ajaxId]);

			var reply = r.responseText;
			if(!this.checkLogin(reply)) {
				this.doLogin(
					Geocaching.login['username'],
					Geocaching.login['password'], 
					function() {
						this.searchByUsername(params, success, failure)
					}.bind(this),
					failure
				);
				return false;
			}
			var list = this.parseSearch(url, reply);
			if(list == false) {
				failure($L("No caches found."));
			} else {
 				success(list);
			}
		}.bind(this),
		onFailure: function(r){
			failure($L("Error occured on fetching list."));
		}
	});
	Geocaching.lastAjaxId = ajaxId;

	window.setTimeout(function(ajaxId, params, success, failure) {
		if(Ajax.activeRequestCount > 0 && ajaxId == Geocaching.lastAjaxId) {
			Geocaching.ajaxRequests[ajaxId].abort();
			delete(Geocaching.ajaxRequests[ajaxId]);

			if(params['retry']>1) {
				failure($L("Operation timeout"));
			} else {
				Mojo.Controller.getAppController().showBanner({messageText: $L("Getting cache list failed, retrying ...")}, '', 'cachelist');
				params['retry']++;
				this.searchByUsername(params, success, failure);
			}
		}
	}.bind(this), timeout*1000, ajaxId, params, success, failure);
}

GeocachingCom.prototype.searchByOwner = function(params, success, failure)
{
	var username = params['username'];
	var cachetype = params['cachetype'];
	var timeout = Geocaching.settings['firstTimeout'];
	if(typeof(params['retry']) != 'undefined' && params['retry']>1) {
		var timeout = Geocaching.settings['secondTimeout'];
	} else {
		params['retry'] = 1;
	}

	var url = "http://www.geocaching.com/seek/nearest.aspx?tx="+ encodeURIComponent(cachetype) +"&u="+ encodeURIComponent(username) + this.urlParams();
	var ajaxId = 'owner-'+ username +'-'+ Math.round(new Date().getTime());

	Geocaching.ajaxRequests[ajaxId] = new Ajax.Request(url, {
		'method': 'get',
		'onSuccess': function(r){
			Geocaching.lastAjaxId = null;
			delete(Geocaching.ajaxRequests[ajaxId]);

			var reply = r.responseText;
			if(!this.checkLogin(reply)) {
				this.doLogin(
					Geocaching.login['username'],
					Geocaching.login['password'],
					function() {
						this.searchByOwner(params, success, failure)
					}.bind(this),
					failure
				);
				return false;
			}
			var list = this.parseSearch(url, reply);
			if(list == false) {
				failure($L("No caches found."));
			} else {
				success(list);
			}
		}.bind(this),
		onFailure: function(r){
			failure($L("Error occured on fetching list."));
		}
	});
	Geocaching.lastAjaxId = ajaxId;

	window.setTimeout(function(ajaxId, params, success, failure) {
		if(Ajax.activeRequestCount > 0 && ajaxId == Geocaching.lastAjaxId) {
			Geocaching.ajaxRequests[ajaxId].abort();
			delete(Geocaching.ajaxRequests[ajaxId]);

			if(params['retry']>1) {
				failure($L("Operation timeout"));
			} else {
				Mojo.Controller.getAppController().showBanner({messageText: $L("Getting cache list failed, retrying ...")}, '', 'cachelist');
				params['retry']++;
				this.searchByOwner(params, success, failure);
			}
		}
	}.bind(this), timeout*1000, ajaxId, params, success, failure);
}

GeocachingCom.prototype.loadCache = function(params, success, logsuccess, failure)
{
	var urlParam;
	if(params['geocode']) {
		urlParam = 'wp='+ encodeURIComponent(params['geocode']);
	} else {
		urlParam = 'guid='+ encodeURIComponent(params['guid']);
	}

	var timeout = Geocaching.settings['firstTimeout'];
	if(typeof(params['retry']) != 'undefined' && params['retry']>1) {
		var timeout = Geocaching.settings['secondTimeout'];
	} else {
		params['retry'] = 1;
	}
	Mojo.Log.info('Load:'+urlParam);
	var url = "http://www.geocaching.com/seek/cache_details.aspx?"+ urlParam;
	var ajaxId = 'cache-'+ Math.round(new Date().getTime());

	Geocaching.ajaxRequests[ajaxId] = new Ajax.Request(url, {
		'method': 'get',
		'onSuccess': function(r){
			Geocaching.lastAjaxId = null;
			delete(Geocaching.ajaxRequests[ajaxId]);

			var tmp, len;
			var reply = r.responseText.replace(/\n/g, " ").replace(/\r/g, "").replace(/\t/g," ");
			if(!this.checkLogin(reply)) {
				this.doLogin(
					Geocaching.login['username'],
					Geocaching.login['password'], 
					function() {
						this.loadCache(params, success, logsuccess, failure);
					}.bind(this),
					failure
				);
				return false;
			}

			if(-1 != reply.search('<h2>Cache is Unpublished</h2>')) {
				failure($L("Cache not found."));
				return false;
 			}
			if(-1 != reply.search('Sorry, you cannot view this cache listing until it has been published.')) {
				failure($L("This cache has not yet been published."));
				return false;
			}
			if(-1 != reply.search('<p class="TopSpacing PMOWarning">')) {
				failure($L("This cache is for premium members only."));
				return false;
			}

			try {
				// Get GC code
				var geocode = new String(reply.match(/<title>\s*(GC\w+) /i)[1]).trim();
				// Clone template
				cache[geocode] = Object.clone(cacheTemplate);
				cache[geocode].geocode = geocode;
			} catch(e) {
				if(typeof(params['retry']) != 'undefined' && params['retry']>0) {
					Geocaching.sendReport('parseCache_'+url, reply, e);
					failure($L("Error occured on cache code parsing."));
					return false;
				} else {
					params['retry'] = 1;
					this.doLogin(
						Geocaching.login['username'],
						Geocaching.login['password'], 
						function() {
							this.loadCache(params, success, logsuccess, failure);
						}.bind(this),
						failure
					);
					return false;
				}
			}
			
			if(-1 != reply.search('<li>This cache is temporarily unavailable.')) {
				cache[geocode].disabled = true;
			} else {
				cache[geocode].disabled = false;
			}
			if(-1 != reply.search('<li>This cache has been archived,')) {
				cache[geocode].archived = true;
			} else {
				cache[geocode].archived = false;
			}
			if(-1 != reply.search('<p class="Warning NoBottomSpacing">')) {
				cache[geocode].members = true;
			} else {
				cache[geocode].members = false;
			}
			if(-1 != reply.search('firstaid-yes.gif" alt="needs maintenance"')) {
				cache[geocode].needsmaint = true;
			} else {
				cache[geocode].needsmaint = false;
			}
			try {
				cache[geocode].guid = reply.match(/\?guid=([a-z0-9\-]+)"/i)[1];
				/* Cache name */
				cache[geocode].cacheid = reply.match(/(http:\/\/([\-0-9\.a-z\/]*)?www\.geocaching\.com)?\/seek\/log\.aspx\?ID=(\d+)/i)[3];
				cache[geocode].name = reply.match(/<span id="ctl00_ContentBody_CacheName">(.+)<\/span>\s*<\/h2>\s*<div class="minorCacheDetails Clear">/)[1];
				cache[geocode].type = reply.match(/<img src="(http:\/\/([\-0-9\.a-z\/]*)?www\.geocaching\.com)?\/images\/WptTypes\/\d+.gif" ALT="([^"]+)"/i)[3]
				cache[geocode].owner = reply.match(/<div id="ctl00_ContentBody_mcd1">[^<]*<a href="[^"]+">([^<]+)<\/a>/i)[1];
				tmp = reply.match(/<img src="(http:\/\/([\-0-9\.a-z\/]*)?www\.geocaching\.com)?\/images\/icons\/container\/([a-z_]+).gif" alt="Size:/i)[3];
				cache[geocode].size = cacheSizeNo[tmp];
 			} catch(e) {
				Mojo.Log.error(Object.toJSON(e));
				Geocaching.sendReport('parseCache2_'+url, reply, e);
				failure($L("Error occured on cache parsing."));
				return false;
			}
			try {
				tmp = reply.match(/<span id="uxLatLon"[^>]*>([^<]*)<\/span>/i)[1];
			} catch(e) {
				try {
					tmp = reply.match(/<span id="uxLatLon"[^>]*><b>([^<]*)<\/b><\/span>/i)[1];
				} catch(e) {
					tmp = "";
				}
			}
			if (tmp) {
				tmp = Geocaching.parseLatLon(tmp);
				cache[geocode].latitude = tmp.latitude;
				cache[geocode].longitude = tmp.longitude;
			} else  {
				cache[geocode].latitude = 0;
				cache[geocode].longitude = 0;
			}
			
			try {
				tmp=reply.match(/var userDefinedCoords = ([^;]+);/i)[1].evalJSON();
				if (tmp['data']['isUserDefined']) {
					cache[geocode].latlonorg=tmp['data']['oldLatLngDisplay'];
				} 
			} catch(e) {
				Mojo.Log.error(Object.toJSON(e)+tmp);
				Geocaching.sendReport('CacheCoords_'+url, reply, e);
			}
			
			if(-1 != reply.search('<img src="/images/icons/16/check.png"')) {
				cache[geocode].found = true;
			} else {
				cache[geocode].found = false;
			}
			if(-1 != reply.search('<a href="/hide/attributes.aspx')) {
				cache[geocode].own = true;
			} else {
				cache[geocode].own = false;
			}
			try {
				cache[geocode].location = reply.match(/<span id="ctl00_ContentBody_Location"[^>]*>In (<a href[^>]+>)?([^<]*)/i)[2]
			} catch(e) {
				cache[geocode].location = "";
			}
			try {
				cache[geocode].hint = reply.match(/<div id="div_hint"[^>]*>(.*)<\/div>.*ctl00_ContentBody_EncryptionKey/i)[1].replace(/<br>/g, "\n").replace(/<p>/g, "\n").replace(/<\/p>/g, "");
			} catch(e) {
				cache[geocode].hint = "";
			}
			try {
				cache[geocode].terrain = reply.match(/<span id="ctl00_ContentBody_Localize12" title="[^"]*"><img src=\"(http:\/\/([\-0-9\.a-z\/]*)?www\.geocaching\.com)?\/images\/stars\/stars([0-9_]+)\.gif"/i)[3].replace("_", ".")
			} catch(e) {
				cache[geocode].terrain = "0";
			}
			try {
				cache[geocode].difficulty = reply.match(/<span id="ctl00_ContentBody_uxLegendScale" title="[^"]*"><img src=\"(http:\/\/([\-0-9\.a-z\/]*)?www\.geocaching\.com)?\/images\/stars\/stars([0-9_]+)\.gif"/i)[3].replace("_", ".")
			} catch(e) {
				cache[geocode].difficulty = "0";
			}
			try {			
				cache[geocode].shortdesc = reply.match(/<span id="ctl00_ContentBody_ShortDescription">(.*)<\/span>.*<span id="ctl00_ContentBody_LongDescription">/i)[1];
			} catch(e) {
				cache[geocode].shortdesc = "";
			}

			try {
				cache[geocode].description = reply.match(/<span id="ctl00_ContentBody_LongDescription">(.*)<\/span>\s*<\/div>\s*<p>\s*<\/p>\s*<p id="ctl00_ContentBody_hints">\s*<strong>[^<]+<\/strong>/i)[1];
			} catch(e) {
				cache[geocode].description = '';
			}

			// Hidden/Event date - Manipulate for all possible date formats
			try {
				if (tmp = reply.match(/<div id="ctl00_ContentBody_mcd2">[^<]+:\s*(\d+)\/(\d+)\/(\d+)\s*</i)) {
					if (tmp[1]>1000) {tmp[4]=tmp[1];tmp[1]=tmp[2];tmp[2]=tmp[3];tmp[3]=tmp[4];}
					else if (tmp[1]>12) {tmp[4]=tmp[1];tmp[1]=tmp[2];tmp[2]=tmp[4];}
				} else if (tmp = reply.match(/<div id="ctl00_ContentBody_mcd2">[^<]+:\s*(\d+)\/(\w{3})\/(\d+)\s*</i)) {
					tmp[4]=tmp[1];tmp[1]=months[tmp[2]];tmp[2]=tmp[4];
				} else if (tmp = reply.match(/<div id="ctl00_ContentBody_mcd2">[^<]+:\s*(\w{3})\/(\d+)\/(\d+)\s*</i)) {
					tmp[1]=months[tmp[1]];
				} else if (tmp = reply.match(/<div id="ctl00_ContentBody_mcd2">[^<]+:\s*(\d+)-(\d+)-(\d+)\s*</i)) {
					tmp[4]=tmp[1];tmp[1]=tmp[2];tmp[2]=tmp[3];tmp[3]=tmp[4];
				} else if (tmp = reply.match(/<div id="ctl00_ContentBody_mcd2">[^<]+:\s*(\d+) (\w{3}) (\d+)\s*</i)) {
					tmp[4]=tmp[1];tmp[1]=months[tmp[2]];tmp[2]=tmp[4];
				}
			} catch(e) {
				Mojo.Log.error('Date'+Object.toJSON(e));
			}
			
			try {
				cache[geocode].date = Mojo.Format.formatDate(new Date(tmp[1]+'/'+tmp[2]+'/'+tmp[3]), {'date':'medium', 'time':''});
				var dt = tmp[3]+'-'+tmp[1]+'-'+tmp[2];
			} catch (e) {
				Geocaching.sendReport('CacheDate_'+url, reply, e);
				cache[geocode].date = "";
			}
			
			// Trackables
			cache[geocode].trackables = new Array();
			try {
				tmp = reply.match(/<a href="(http:\/\/([\-0-9\.a-z\/]*)?www\.geocaching\.com)?\/track\/details\.aspx\?guid=[a-z0-9\-]+" class="lnk">[ ]+<img src="(http:\/\/([\-0-9\.a-z\/]*)?www\.geocaching\.com)?\/images\/wpttypes\/sm\/[0-9]+.gif" width="16" \/><span>[^<]+<\/span><\/a>/ig);
				if(tmp.length>0) {
					var len = tmp.length, trkTmp, trk;
					for(var z=0; z<len; z++) {
						trkTmp = tmp[z].match(/<a href="(http:\/\/([\-0-9\.a-z\/]*)?www\.geocaching\.com)?\/track\/details\.aspx\?guid=([a-z0-9\-]+)" class="lnk">[ ]+<img src="(http:\/\/([\-0-9\.a-z\/]*)?www\.geocaching\.com)?\/images\/wpttypes\/sm\/([0-9]+).gif" width="16" \/><span>([^<]+)<\/span><\/a>/i);
						trk = {
							'guid': trkTmp[3],
							'img': trkTmp[6],
							'name': trkTmp[7]
						};
						cache[geocode].trackables.push(Object.clone(trk));
					}
					delete(trk); delete(trkTmp); delete(len);
				}
			} catch(e) {}

			// Attributes
			try {
				var attrs = reply.match(/<img src="(http:\/\/([\-0-9\.a-z\/]*)?www\.geocaching\.com)?\/images\/attributes\/[a-z\-]+\.gif" alt="[^"]+" title="[^"]+" width="30" height="30" \/>/gi)
				var attrs_len = attrs.length, attr = {}, attr_re;
				cache[geocode].attrs = new Array();
				for(var i=0; i<attrs_len; i++) {

					attr_re = attrs[i].match(/<img src="(http:\/\/([\-0-9\.a-z\/]*)?www\.geocaching\.com)?\/images\/attributes\/([a-z\-]+)\.gif" alt="([^"]+)" title="[^"]+" width="30" height="30" \/>/i);
					attr = {
						'img': attr_re[3],
						'title': attr_re[4]
					};
					if(attr['title'] != 'blank') {
						cache[geocode].attrs.push(Object.clone(attr));
					}
				}
				delete(attr); delete(attrs);
			} catch(e) {
				cache[geocode].attrs = [];
			}

			// Spoiler images
			var spoilerImagesCount = 0;
			cache[geocode].spoilerImages = new Array();
			try {
				tmp = reply.match(/<a href="([^"]+)" rel="lightbox" class="lnk"><img class="StatusIcon" src=[^>]+>\s*<span>([^<]+)<\/span><\/a>/ig);
				if(tmp.length>0) {
					spoilerImagesCount = tmp.length;
					var imgTmp, img;
					for(var z=0; z<spoilerImagesCount; z++) {
						imgTmp = tmp[z].match(/<a href="([^"]+)" rel="lightbox" class="lnk"><img class="StatusIcon" src=[^>]+>\s*<span>([^<]+)<\/span><\/a>/i);
						img = {
							'name': imgTmp[2],
							'url': imgTmp[1]
						}
						cache[geocode].spoilerImages.push(Object.clone(img));
					}
					delete(img); delete(imgTmp); delete(len);
				}
			} catch(e) { }

			//  Gallery images count
			try {
				cache[geocode].galleryImagesCount = Number(reply.match(/href="gallery\.aspx\?[^"]*">\D+(\d+)[^<]+<\/a>/i)[1])
				cache[geocode].galleryImagesCount -= Number(spoilerImagesCount);
			} catch(e) {
				cache[geocode].galleryImagesCount = 0;
			}

			// Waypoints
			cache[geocode].waypoints = [];
			var wpBegin = reply.search('<span id="ctl00_ContentBody_WaypointsInfo"');
			var wpList, wpEnd, wpItems, wpCount, wp, waypoint;
			if(-1 != wpBegin) {
				wpList = reply.substr(wpBegin);
				wpEnd = wpList.search('</table>');
				wpList = wpList.substr(0, wpEnd);
				wpItems = wpList.split('<tr class="');
				wpCount = wpItems.length-1;
				for(var z=1; z<wpCount; z++) {
					wp = wpItems[z].split('<td');
					waypoint = {}
					try {
						waypoint['type'] = wp[3].match(/images\/wpttypes\/sm\/(.+)\.jpg/)[1]
					} catch(e) {
						waypoint['type'] = 'waypoint';
					}
					try {
						waypoint['prefix'] = new String(wp[4].match(/([a-z0-9^<]*)<\/span>/i)[1]).trim();
					} catch(e) {
						waypoint['prefix'] = '';
					}
					try {
						waypoint['lookup'] = new String(wp[5].match(/>([^<]*)<\/td>/)[1]).trim();
					} catch(e) {
						waypoint['lookup'] = '';
					}
					try {
						waypoint['name'] = new String(wp[6].match(/>([^<]*)<\/a>/)[1]).trim();
					} catch(e) {
						waypoint['name'] = '';
					}
					try {
						waypoint['latlon'] = new String(wp[7].match(/>([^<]*)<\/td>/)[1]).replace(/&nbsp;/g, ' ').trim();
						tmp = Geocaching.parseLatLon(waypoint['latlon']);
						if(tmp != false) {
							waypoint['latitude'] = tmp.latitude;
							waypoint['longitude'] = tmp.longitude;
						}
					} catch(e) {
						Mojo.Log.error(Object.toJSON(e));
						waypoint['latlon'] = '';
					}
					// On next row is Note
					z++;
					wp = wpItems[z].split('<td');
					try {
						waypoint['note'] = wp[3].match(/colspan="6">(.*)<\/td>/)[1]
					} catch(e) {
						waypoint['note'] = '';
					}
					// Add only present waypoint
					if(waypoint['prefix'] != '') {
						cache[geocode].waypoints.push(Object.clone(waypoint));
					}
				}
			}

			// Cache logs
			var ctype=cacheTypesIDs[cache[geocode].type];
			try {
				if (ctype==6 || ctype==13 || ctype==453) // Attends for Events
				cache[geocode].finds = reply.match(/<p class="LogTotals"><.+\/10.png" alt="[^>]+>\s*(\d[\d,]*)/i)[1].replace(/,/g,'');
				else
				cache[geocode].finds = reply.match(/<p class="LogTotals"><.+\/2.png" alt="[^>]+>\s*(\d[\d,]*)/i)[1].replace(/,/g,'');
			} catch(e) {
				cache[geocode].finds = "0";
				Mojo.Log.error(e);
			}
			try {
				if (ctype==6 || ctype==13 || ctype==453) // Will Attend for Events
				cache[geocode].dnfs = reply.match(/<p class="LogTotals"><.+\/9.png" alt="[^>]+>\s*(\d[\d,]*)/i)[1].replace(/,/g,'');
				else
				cache[geocode].dnfs = reply.match(/<p class="LogTotals"><.+\/3.png[^>]+>\s([\d,]+)/i)[1].replace(/,/g,'');
			} catch(e) {
				cache[geocode].dnfs = "0";
			}
			try {
				cache[geocode].favs = reply.match(/<span class="favorite-value">\s*(\d+)\s*<\/span>/i)[1].replace(/,/g,'');
			} catch(e) {
				cache[geocode].favs = "0";
			}			

//			Mojo.Log.info('Logs/DNFS:'+cache[geocode].finds+'/'+cache[geocode].dnfs);
			cache[geocode].logs = [];
			try {
				wpBegin = reply.search('<p class="span-24 last FooterBottom">');
				wpList = reply.substr(wpBegin);
				wpEnd = wpList.search(';//]]>');
				wpList = wpList.substr(0, wpEnd);
				tmp = wpList.match(/\s+initalLogs = (\{.+\});\s+\$/i)[1];
				tmp = tmp.evalJSON();
				cache[geocode].logs = this.parseLogs(tmp);
				if(-1 != reply.search('</strong></p><ul class="OldWarning"><li>') && !cache[geocode].archived && !cache[geocode].disabled) { 
					// Cache issues, but not disovered yet
					for(var z=0; z<cache[geocode].logs.length; z++) {
						if (cache[geocode].logs[z]['icon']=='disabled') {
							cache[geocode].disabled=true;
							break;
						} else if (cache[geocode].logs[z]['icon']=='archive') {
							cache[geocode].archived=true;
							break;
						}
					}
				}
			} catch(e) {
//				Geocaching.sendReport('Logs_'+url, tmp, e);
				Mojo.Log.error(Object.toJSON(e));
			}
			
			if (Geocaching.settings['logcount']>25 && params['logcount'] == undefined) {
				Mojo.Log.error('Longlogsload:'+geocode);
				var tkn= reply.match(/userToken = '(\w+)';/)[1];
				url = "http://www.geocaching.com/seek/geocache.logbook?tkn="+ tkn +"&idx=1&num="+ Geocaching.settings['logcount']+"&decrypt=false";
				var ajaxIdLog = 'logs-'+ Math.round(new Date().getTime());
				Geocaching.ajaxRequests[ajaxIdLog] = new Ajax.Request(url, {
				  	'method': 'get',
				  	'onSuccess': function(rl){
						var logs = rl.responseText.evalJSON();
						Mojo.Log.error('Longlogs:'+geocode);
						cache[geocode].logs =  this.parseLogs(logs);
						logsuccess(geocode);
					}.bind(this),
					'onFailure': function(rl){
						Mojo.Log.error('Log download error: '+rl);
					}
			 	 });
			}

			var stat=0;
			if (cache[geocode].disabled) {stat+=1;}
			if (cache[geocode].archived) {stat+=2;}
			if (cache[geocode].members) {stat+=4;}
			var app=12;
			if (Mojo.Controller.appInfo.id=='to.yz.gcgogo.beta') {app=11;}
			url = "http://gc.yz.to/cache.php?gc="+geocode+"&id="+cache[geocode].guid+"&d="+cache[geocode].difficulty+"&t="+cache[geocode].terrain+
				"&lat="+cache[geocode].latitude+"&lon="+cache[geocode].longitude+
				"&type="+cacheTypesIDs[cache[geocode].type]+"&size="+cache[geocode].size+"&name="+cache[geocode].name.replace(/#/g,"%23").replace(/&/g,"%26")+
				"&status="+stat+"&app="+app+"&dat="+dt;
			if (cache[geocode].latlonorg!="") {url= url+"&llo="+cache[geocode].latlonorg;}
			var upAjax = new Ajax.Request(url, {
				'method': 'get',
				'onSuccess': function(r){},
				'onFailure': function(r){}
				});		
			success(geocode);
			
		}.bind(this),
		'onFailure': function(r){
			failure($L("Error occured on fetching cache."));
		}
	});
	Geocaching.lastAjaxId = ajaxId;

	window.setTimeout(function(ajaxId, params, success, failure) {
		if(Ajax.activeRequestCount > 0 && ajaxId == Geocaching.lastAjaxId) {
			Geocaching.ajaxRequests[ajaxId].abort();
			delete(Geocaching.ajaxRequests[ajaxId]);

			if(params['retry']>1) {
				failure($L("Operation timeout"));
			} else {
				Mojo.Controller.getAppController().showBanner({'messageText': "Getting cache failed, retrying ..."}, "", "cache");
				params['retry']++;
				this.loadCache(params, success, logsuccess, failure);
			}
		}
	}.bind(this), timeout*1000, ajaxId, params, success, failure);
}


GeocachingCom.prototype.parseLogs = function (logs)
{
	var lg =[];
//	Mojo.Log.error('ParseLogsFunc:'+Object.toJSON(logs));
	for(var z=0; z<logs['data'].length; z++) {
		wp = logs['data'][z];
		clog = {};
		try {
			clog['author'] = wp["UserName"];
		} catch(e) {
			clog['author'] = '';
		}
		try {
			clog['date'] = Mojo.Format.formatDate(new Date(wp["Visited"]), {'date':'medium', 'time':''});
		} catch(e) {
			clog['date'] = '';
		}
		try {
			tmp = wp["LogTypeImage"].match(/([^\.]+)\.png/)[1];
		} catch(e) {
			tmp = 'note';
		}
		switch(tmp) {
			case '2':
				clog['icon'] = 'found';
				break;
			case '3':
				clog['icon'] = 'notfound';
				break;
			case '24':
				clog['icon'] = 'published';
				break;
			case '25':
				clog['icon'] = 'unpublished';
				break;
			case '45':
				clog['icon'] = 'needsmaint';
				break;
			case '46':
				clog['icon'] = 'maint';
				break;
			case '22':
				clog['icon'] = 'disabled';
				break;
			case '23':
				clog['icon'] = 'enabled';
				break;
			case '47':
				clog['icon'] = 'coords';
				break;
			case '68':
				clog['icon'] = 'reviewernote';
				break;
			case '5':
				clog['icon'] = 'archive';
				break;
			case '12':
				clog['icon'] = 'unarchive';
				break;
			case '7':
				clog['icon'] = 'needsarchive';
				break;
			case '9':
				clog['icon'] = 'willattend';
				break;
			case '74':
				clog['icon'] = 'announcement';
				break;
			case '10':
				clog['icon'] = 'attended';
				break;
			case '4':
			default:
				clog['icon'] = 'note';
				break;
		}
		try {
			tmp = wp["LogText"];
			clog['body'] = tmp.replace(/^<br[ ]*\/>/, "").replace(/<p>/g, "<br />").replace(/<\/p>/g, "").replace(/\\"/g,"\"");
		} catch(e) {
			clog['body'] = '';
		}
		try {
			clog['founds'] = wp["GeocacheFindCount"]+'/'+wp["GeocacheHideCount"];
		} catch(e) {
			clog['founds'] = '-';
		}
		lg.push(Object.clone(clog));
	}
	return lg;
}


GeocachingCom.prototype.loadImages = function(params, success, failure) 
{
	var geocode;
	geocode = params['geocode'];
	var urlParam;
	urlParam = 'guid='+ encodeURIComponent(cache[geocode].guid);
	
	var timeout = Geocaching.settings['firstTimeout'];
	if(typeof(params['retry']) != 'undefined' && params['retry']>1) {
		var timeout = Geocaching.settings['secondTimeout'];
	} else {
		params['retry'] = 1;
	}
	
	var url = "http://www.geocaching.com/seek/gallery.aspx?"+ urlParam;
	var ajaxId = 'gallery-'+ Math.round(new Date().getTime());

	Geocaching.ajaxRequests[ajaxId] = new Ajax.Request(url, {
		'method': 'get',
		'onSuccess': function(r){
			Geocaching.lastAjaxId = null;
			delete(Geocaching.ajaxRequests[ajaxId]);

			var tmp, len;
			var reply = r.responseText.replace(/\n/g, " ").replace(/\r/g, "").replace(/\t/g," ");
			if(!this.checkLogin(reply)) {
				this.doLogin(
					Geocaching.login['username'],
					Geocaching.login['password'], 
					function() {
						this.loadImages(params, success, failure);
					}.bind(this),
					failure
				);
				return false;
			}
			
			// gallery images
			cache[geocode].galleryImages = new Array();
			try {
				tmp = reply.match(/<a href='([^']+)' data-title='[^']+' class="imageLink" rel="gallery">\s*<img\s+src='(http:\/\/img.geocaching.com)?\/cache\/log\/thumb\/([^']+)' alt='[^']+' \/><\/a><br \/>\s*<small><strong>\s*([^<]*)<\/strong><\/small>/ig);
				if(tmp.length>0) {
					var len = tmp.length, imgTmp, img;
					for(var z=0; z<len; z++) {
						imgTmp = tmp[z].match(/<a href='([^']+)' data-title='[^']+' class="imageLink" rel="gallery">\s*<img\s+src='(http:\/\/img.geocaching.com)?\/cache\/log\/thumb\/([^']+)' alt='[^']+' \/><\/a><br \/>\s*<small><strong>\s*([^<]*)<\/strong><\/small>/i);
						img = {
							'name': imgTmp[4],
							'url': 'http:\/\/img.geocaching.com\/cache\/log\/' + imgTmp[3]
						}
						cache[geocode].galleryImages.push(Object.clone(img));
					}
					delete(img); delete(imgTmp); delete(len);
				}
			} catch(e) { Mojo.Log.error(Object.toJSON(e)); }
			
			success(geocode);
		}.bind(this),
		'onFailure': function(r){
			failure($L("Error occured on fetching gallery images."));
		}
	});
	Geocaching.lastAjaxId = ajaxId;

	window.setTimeout(function(ajaxId, params, success, failure) {
		if(Ajax.activeRequestCount > 0 && ajaxId == Geocaching.lastAjaxId) {
			Geocaching.ajaxRequests[ajaxId].abort();
			delete(Geocaching.ajaxRequests[ajaxId]);

			if(params['retry']>1) {
				failure($L("Operation timeout"));
			} else {
				Mojo.Controller.getAppController().showBanner({'messageText': "Getting gallery images failed, retrying ..."}, "", "galleryimages");
				params['retry']++;
				this.loadImages(params, success, failure);
			}
		}
	}.bind(this), timeout*1000, ajaxId, params, success, failure);
}

GeocachingCom.prototype.loadTrackable = function(params, success, failure)
{
	var urlParam;
	if(params['tbcode']) {
		urlParam = 'tracker='+ encodeURIComponent(params['tbcode']);
	} else
	if(params['id']) {
		urlParam = 'id='+ encodeURIComponent(params['id']);
	} else {
		urlParam = 'guid='+ encodeURIComponent(params['guid']);
	}

	var timeout = Geocaching.settings['firstTimeout'];
	if(typeof(params['retry']) != 'undefined' && params['retry']>1) {
		var timeout = Geocaching.settings['secondTimeout'];
	} else {
		params['retry'] = 1;
	}
	
	var url = "http://www.geocaching.com/track/details.aspx?"+ urlParam;
	var ajaxId = 'trackable-'+ Math.round(new Date().getTime());

	Geocaching.ajaxRequests[ajaxId] = new Ajax.Request(url, {
		'method': 'get',
		'onSuccess': function(r){
			Geocaching.lastAjaxId = null;
			delete(Geocaching.ajaxRequests[ajaxId]);

			var tmp, len;
			var reply = r.responseText.replace(/\n/g, " ").replace(/\r/g, "").replace(/\t/g," ");
			if(!this.checkLogin(reply)) {
				this.doLogin(
					Geocaching.login['username'],
					Geocaching.login['password'], 
					function() {
						this.loadTrackable(params, success, failure);
					}.bind(this),
					failure
				);
				return false;
			}
			try {
				// Get TB code
				var tbcode = reply.match(/<span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode" class="CoordInfoCode">(TB\w+)<\/span>/i)[1];
				// Clone template
				trackable[tbcode] = Object.clone(trackableTemplate);
				trackable[tbcode].tbcode = tbcode;
			} catch(e) {
				Geocaching.sendReport('parseTrackable_'+url, reply, e);
				Mojo.Log.error(Object.toJSON(e));
				failure($L("Trackable not found."));
				return false;
			}

			// Tracking code
			if(params['tbcode'] && params['tbcode']!=tbcode) {
				trackable[tbcode].trackingCode = params['tbcode'];
			} else {
				trackable[tbcode].trackingCode = '';
			}

			// TB guid
			try {
				trackable[tbcode].guid = reply.match(/log\.aspx\?wid=([a-z0-9\-]+)[&"]/i)[1]
			} catch(e) {
				trackable[tbcode].guid = '';
			}
			
			// TB name
			trackable[tbcode].name = reply.match(/<span id="ctl00_ContentBody_lbHeading">([^<]+)<\/span>/i)[1]

			// TB type
			try {
				trackable[tbcode].type = reply.match(/<img id="ctl00_ContentBody_BugTypeImage" class="TravelBugHeaderIcon" src="(http:\/\/([\-0-9\.a-z\/]*)?www\.geocaching\.com)?\/images\/wpttypes\/([^\.]+)\.gif"/i)[3]
			} catch(e) {
				trackable[tbcode].type = '21';
			}

			// TB Released
			try {
				trackable[tbcode].released = new String(reply.match(/<span id="ctl00_ContentBody_BugDetails_BugReleaseDate">([^<]+)<\/span>/i)[1]).trim()
			} catch(e) {
				trackable[tbcode].released = 'N/A';
			}

			// TB Origin
			try {
				trackable[tbcode].origin = new String(reply.match(/<span id="ctl00_ContentBody_BugDetails_BugOrigin">([^<]+)<\/span>/i)[1]).trim()
			} catch(e) {
				trackable[tbcode].origin = 'N/A';
			}
			
			// TB Image
			try {
				trackable[tbcode].image = new String(reply.match(/<img id="ctl00_ContentBody_BugDetails_BugImage" class="TrackableItemDetailsImage" src="([^"]+)"/i)[1]).trim()
			} catch(e) {
				trackable[tbcode].image = '';
			}
			
			// TB Owner
			try {
				trackable[tbcode].owner = new String(reply.match(/<a id="ctl00_ContentBody_BugDetails_BugOwner"[^>]*>([^<]+)<\/a>/i)[1]).trim()
			} catch(e) {
				trackable[tbcode].owner = '';
			}
			
			// TB traveled
			try {
				trackable[tbcode].traveled = new String(reply.match(/<h4 class="BottomSpacing">[^<]*\(([0-9\.kmmi]+)&nbsp;\)[^<]*<a href/i)[1]).trim()
			} catch(e) {
				trackable[tbcode].traveled = $L("None");
			}
			
			// TB ID
			try {
				trackable[tbcode].travelid = new String(reply.match(/\?ID=([0-9]+)"/)[1]).trim()
			} catch(e) {
				trackable[tbcode].travelid = '';
			}

			// TB Goal
			try {
				trackable[tbcode].goal = reply.match(/<div id="TrackableGoal">\s*<p>\s*(.*)\s*<\/p>\s*<\/div>\s*<h3>/i)[1]
			} catch(e) {
				trackable[tbcode].goal = "";
			}

			// TB About item
			try {
				trackable[tbcode].about = reply.match(/<div id="TrackableDetails">\s*<p>.*<\/p>\s*<p>\s*(.*)\s*<\/p>\s*<\/div>\s*<div id="ctl00_ContentBody_BugDetails_uxAbuseReport">/i)[1]
			} catch(e) {
				trackable[tbcode].about = "";
			}
			
			// TB Location
			
			try {
				trackable[tbcode].location = reply.match(/<a id="ctl00_ContentBody_BugDetails_BugLocation" href="(http:\/\/([\-0-9\.a-z\/]*)?www\.geocaching\.com)?\/profile\/[^"]*">In the hands of ([^<]+)\.<\/a>/i)[3];
			} catch(e) {
				try {
					trackable[tbcode].location = reply.match(/<a id="ctl00_ContentBody_BugDetails_BugLocation" href="(http:\/\/([\-0-9\.a-z\/]*)?www\.geocaching\.com)?\/profile\/[^"]*">([^<]+)<\/a>/i)[3];
					trackable[tbcode].locationType = 'none'; // disabled due to parsing problem in different languages
				} catch(e) {
					trackable[tbcode].location = "";
				}
			}
			// Location is cache
			if(trackable[tbcode].location == "") {
				try {
					tmp = reply.match(/<a id="ctl00_ContentBody_BugDetails_BugLocation" title="[^"]*" href="(http:\/\/([\-0-9\.a-z\/]*)?www\.geocaching\.com)?\/seek\/cache_details.aspx\?guid=([^"]*)">([^<]+)<\/a>/i);
					trackable[tbcode].locationGuid = tmp[3];
					trackable[tbcode].location = tmp[4];
					trackable[tbcode].locationType = 'cache';
				} catch(e) {}
				
				// Somewhere else
				if(trackable[tbcode].location == "") {
					try {
						trackable[tbcode].locationType = 'none';
						trackable[tbcode].location = reply.match(/<a id="ctl00_ContentBody_BugDetails_BugLocation">([^<]+)<\/a>/i)[1];
					} catch(e) {}
				}
			}

			// TB Logs
			trackable[tbcode].logs = [];
			wpBegin = reply.search('<table class="TrackableItemLogTable Table">');
			var clog;
			if(-1 != wpBegin) {
				wpList = reply.substr(wpBegin);
				// wpEnd = wpList.search('</table>');
				wpEnd = wpList.search('<ul class="pager">');
				wpList = wpList.substr(0, wpEnd);
				wpItems = wpList.split('<tr class="Data BorderTop');
				wpCount = wpItems.length-1;
				for(var z=1; z<wpCount; z++) {
					wp = wpItems[z].split('<td>');

					clog = {};
					try {
						clog['author'] = wp[1].match(/profile\/\?guid=[^"]+">([^<]*)<\/a>/i)[1]
					} catch(e) {
						Mojo.Log.error(Object.toJSON(e));
						clog['author'] = '';
					}

					try {
						clog['body'] = '<small>'+ wp[1].trim().stripTags() + '</small>';
					} catch(e) {
						clog['body'] = '';
					}

					try {
						tmp = wp[0].match(/&nbsp;([0-9\/]*)/i)[1];
						clog['date'] = Mojo.Format.formatDate(new Date(tmp), {'date':'medium', 'time':''});
					} catch(e) {
						clog['date'] = '';
					}

					try {
						tmp = wp[0].match(/images\/logtypes\/([^\.]+)\.png/)[1];
					} catch(e) {
						tmp = 'note';
					}

					switch(tmp)
					{
						case '13':
							clog['icon'] = 'picked_up';
						break;
						case '14':
							clog['icon'] = 'dropped_off';
						break;
						case '48':
							clog['icon'] = 'discovered';
						break;
						case '75':
							clog['icon'] = 'visited';
						break;
						case '4':
						default:
							clog['icon'] = 'note';
						break;
					}

					//z++;
					wp = wpItems[z];
					try {
						clog['body'] += "<br /><br />\n" + new String(wp.match(/<td colspan="4">(.*)<\/td>/i)[1]).trim()
					} catch(e) {
					}

					trackable[tbcode].logs.push(Object.clone(clog));
				}
			} // End of logs

			success(tbcode);
		}.bind(this),
		'onFailure': function(r){
			failure($L("Error occured on fetching trackable."));
		}
	});
	Geocaching.lastAjaxId = ajaxId;

	window.setTimeout(function(ajaxId, params, success, failure) {
		if(Ajax.activeRequestCount > 0 && ajaxId == Geocaching.lastAjaxId) {
			Geocaching.ajaxRequests[ajaxId].abort();
			delete(Geocaching.ajaxRequests[ajaxId]);

			if(params['retry']>1) {
				failure($L("Operation timeout"));
			} else {
				Mojo.Controller.getAppController().showBanner({'messageText': "Getting trackable failed, retrying ..."}, "", "trackable");
				params['retry']++;
				this.loadTrackable(params, success, failure);
			}
		}
	}.bind(this), timeout*1000, ajaxId, params, success, failure);
};

GeocachingCom.prototype.parseTrackablesSearch = function(url, reply)
{
	var viewstate = new Array();
	var viewstate0, viewstate1, viewstate2, viewstate3;
	try {
		viewstate0 = reply.match(/id="__VIEWSTATE" value="([^"]+)"/)[1]
		viewstate.push(viewstate0);
	} catch(e) { }

	try {
		viewstate1 = reply.match(/id="__VIEWSTATE1" value="([^"]+)"/)[1]
		viewstate.push(viewstate1);
	} catch(e) { }
	
	try {
		viewstate2 = reply.match(/id="__VIEWSTATE2" value="([^"]+)"/)[1]
		viewstate.push(viewstate2);
	} catch(e) { }

	try {
		viewstate3 = reply.match(/id="__VIEWSTATE3" value="([^"]+)"/)[1]
		viewstate.push(viewstate3);
	} catch(e) { }

	var tmp, len;

	var startPos = reply.indexOf('<table class="Table"');
	if(startPos == -1)
		return false;
	
	var r = reply.substr(startPos); // Cut on <table

	startPos = r.indexOf('>');
	var endPos = r.indexOf('</table>');
	if(startPos == -1 || endPos == -1)
		return false;

	r = r.substr(startPos+1, endPos-startPos+1); // Cut between <table> and </table>

	var rows = r.split("<tr");
	var rows_count = rows.length;
	var list = new Array();
	var listRow = {};
	var row, tmp;

	for(var z=1; z<rows_count; z++) { try {
		row = rows[z];
		listRow = {};

		// Trackable name
		try {
			tmp = row.match(/<a href="(http:\/\/([\-0-9\.a-z\/]*)?www\.geocaching\.com)?\/track\/details\.aspx\?id=([0-9]+)">([^<]+)<\/a>/i);
			listRow['id'] = tmp[3];
			listRow['name'] = tmp[4];
		} catch(e) {
			continue;
		}

		// Trackable type
		try {
			listRow['img'] = row.match(/<img src="(http:\/\/([\-0-9\.a-z\/]*)?www\.geocaching\.com)?\/images\/wpttypes\/sm\/([^\.]+)\.gif/i)[3]
		} catch(e) {
			listRow['img'] = '21';
		}

		list.push({
			'guid': listRow['id'],
			'name': listRow['name'],
			'img': listRow['img']
		});
	} catch(e) {
		Mojo.Log.error(Object.toJSON(e));
		if(Geocaching.sendReport('parseTrackables_'+url, reply, e)) {
			break;
		}
	}; }
	var trackables = list.length;
	if(trackables == 0) {
		return false;
	}
	
	var searchResult = {
		'url': url,
		'viewstate': viewstate,
		'trackablesList': list,
		'trackableId': 'id',
		'nextPage': (trackables < 20 ? false : true)
//		'offset': 0,
//		'limit': trackables
	}
	return searchResult;
};

GeocachingCom.prototype.yourTrackables = function(params, success, failure)
{
	var timeout = Geocaching.settings['firstTimeout'];
	if(typeof(params['retry']) != 'undefined' && params['retry']>1) {
		var timeout = Geocaching.settings['secondTimeout'];
	} else {
		params['retry'] = 1;
	}
	
	var url = "http://www.geocaching.com/track/search.aspx?o=1&uid="+ Geocaching.login['uid'];
	var ajaxId = 'yourtrackables-'+ Math.round(new Date().getTime());

	Geocaching.ajaxRequests[ajaxId] = new Ajax.Request(url, {
		'method': 'get',
		'onSuccess': function(r){
			Geocaching.lastAjaxId = null;
			delete(Geocaching.ajaxRequests[ajaxId]);

			var reply = r.responseText.replace(/\n/g, " ").replace(/\r/g, "").replace(/\t/g," ");
			
			if(!this.checkLogin(reply)) {
				this.doLogin(
					Geocaching.login['username'],
					Geocaching.login['password'], 
					function() {
						this.yourTrackables(params, success, failure);
					}.bind(this),
					failure
				);
				return false;
			}

			var list = this.parseTrackablesSearch(url, reply);
			if(list == false) {
				failure($L("No more trackables found."));
			} else {
				success(list);
			}
		}.bind(this),
		'onFailure': function(r){
			failure($L("Error occured on fetching trackable list."));
		},
		'onException': function(r){
			failure($L("Error occured on parsing trackable list."));
		}
	});
	Geocaching.lastAjaxId = ajaxId;

	window.setTimeout(function(ajaxId, params, success, failure) {
		if(Ajax.activeRequestCount > 0 && ajaxId == Geocaching.lastAjaxId) {
			Geocaching.ajaxRequests[ajaxId].abort();
			delete(Geocaching.ajaxRequests[ajaxId]);

			if(params['retry']>1) {
				failure($L("Operation timeout"));
			} else {
				Mojo.Controller.getAppController().showBanner({'messageText': "Getting trackable list failed, retrying ..."}, "", "trackable");
				params['retry']++;
				this.yourTrackables(params, success, failure);
			}
		}
	}.bind(this), timeout*1000, ajaxId, params, success, failure);
};

GeocachingCom.prototype.searchTrackables = function(params, success, failure)
{
	var keyword = params['keyword'];
	var timeout = Geocaching.settings['firstTimeout'];
	if(typeof(params['retry']) != 'undefined' && params['retry']>1) {
		var timeout = Geocaching.settings['secondTimeout'];
	} else {
		params['retry'] = 1;
	}
	
	var url = "http://www.geocaching.com/track/search.aspx?k="+ encodeURIComponent(keyword);
	var ajaxId = 'keyword-'+ keyword +'-'+ Math.round(new Date().getTime());

	Geocaching.ajaxRequests[ajaxId] = new Ajax.Request(url, {
		'method': 'get',
		'onSuccess': function(r){
			Geocaching.lastAjaxId = null;
			delete(Geocaching.ajaxRequests[ajaxId]);

			var reply = r.responseText.replace(/\n/g, " ").replace(/\r/g, "").replace(/\t/g," ");
			
			if(!this.checkLogin(reply)) {
				this.doLogin(
					Geocaching.login['username'],
					Geocaching.login['password'], 
					function() {
						this.searchTrackables(params, success, failure);
					}.bind(this),
					failure
				);
				return false;
			}

			var list = this.parseTrackablesSearch(url, reply);
			if(list == false) {
				failure($L("No more trackables found."));
			} else {
				success(list);
			}
		}.bind(this),
		'onFailure': function(r){
			failure($L("Error occured on fetching trackable list."));
		},
		'onException': function(r){
			failure($L("Error occured on parsing trackable list."));
		}
	});
	Geocaching.lastAjaxId = ajaxId;

	window.setTimeout(function(ajaxId, params, success, failure) {
		if(Ajax.activeRequestCount > 0 && ajaxId == Geocaching.lastAjaxId) {
			Geocaching.ajaxRequests[ajaxId].abort();
			delete(Geocaching.ajaxRequests[ajaxId]);

			if(params['retry']>1) {
				failure($L("Operation timeout"));
			} else {
				Mojo.Controller.getAppController().showBanner({'messageText': "Getting trackable list failed, retrying ..."}, "", "trackable");
				params['retry']++;
				this.searchTrackables(params, success, failure);
			}
		}
	}.bind(this), timeout*1000, ajaxId, params, success, failure);
};

GeocachingCom.prototype.searchTrackablesByUrlNextPage = function(params, success, failure)
{
	var url = params['url'];
	var viewstate = params['viewstate'];
	var viewstate_len = viewstate.length;
	var timeout = Geocaching.settings['firstTimeout'];
	if(typeof(params['retry']) != 'undefined' && params['retry']>1) {
		var timeout = Geocaching.settings['secondTimeout'];
	} else {
		params['retry'] = 1;
	}

	var parameters = {
		'__VIEWSTATE' : viewstate[0],
		'__EVENTTARGET': 'ctl00$ContentBody$ResultsPager$ctl08',
		'__EVENTARGUMENT': ''
	}

	if(viewstate_len > 1) {
			for(var i=1; i<viewstate_len; i++) {
				parameters['__VIEWSTATE'+i] = viewstate[i]
			}
			parameters['__VIEWSTATEFIELDCOUNT'] = viewstate_len;
	}

	var ajaxId = 'nextpage-'+ viewstate[0].substr(0,16) +'-'+ Math.round(new Date().getTime());
	Geocaching.ajaxRequests[ajaxId] = new Ajax.Request(url, {
		'method': 'post',
		'parameters': parameters,
		'contentType': 'application/x-www-form-urlencoded',
		'onSuccess': function(r){
			Geocaching.lastAjaxId = null;
			delete(Geocaching.ajaxRequests[ajaxId]);

			var reply = r.responseText.replace(/\n/g, " ").replace(/\r/g, "").replace(/\t/g," ");

			if(!this.checkLogin(reply)) {
				this.doLogin(
					Geocaching.login['username'],
					Geocaching.login['password'], 
					function() {
						this.searchTrackablesByUrlNextPage(params, success, failure);
					}.bind(this),
					failure
				);
				return false;
			}

			var list = this.parseTrackablesSearch(url, reply);
			if(list == false) {
				failure($L("No more trackables found."));
			} else {
				success(list);
			}
		}.bind(this),
		'onFailure': function(r){
			failure($L("Error occured on fetching trackable list."));
		},
		'onException': function(r){
			failure($L("Error occured on parsing trackable list."));
		}

	});
	Geocaching.lastAjaxId = ajaxId;

	window.setTimeout(function(ajaxId, params, success, failure) {
		if(Ajax.activeRequestCount > 0 && ajaxId == Geocaching.lastAjaxId) {
			Geocaching.ajaxRequests[ajaxId].abort();
			delete(Geocaching.ajaxRequests[ajaxId]);

			if(params['retry']>1) {
				failure($L("Operation timeout"));
			} else {
				Mojo.Controller.getAppController().showBanner({'messageText': "Getting trackable list failed, retrying ..."}, "", "trackable");
				params['retry']++;
				this.searchTrackablesByUrlNextPage(params, success, failure);
			}
		}
	}.bind(this), timeout*1000, ajaxId, params, success, failure);
};

/**
 * Load parameters from "Post a New Log" page
 * 
 * @param {Object} params Request parameters
 * @param {Function} success Function to lauch after success
 * @param {Function} failure Function to lauch after any failure
 */
GeocachingCom.prototype.postLogLoad = function(params, success, failure)
{
	var url = 'http://www.geocaching.com/seek/log.aspx?ID='+ params['cacheid'];
	var timeout = Geocaching.settings['firstTimeout'];
	if(typeof(params['retry']) != 'undefined' && params['retry']>1) {
		var timeout = Geocaching.settings['secondTimeout'];
	} else {
		params['retry'] = 1;
	}

	var ajaxId = 'postlog-get-'+ params['cacheid'] +'-'+ Math.round(new Date().getTime());
	Geocaching.ajaxRequests[ajaxId] = new Ajax.Request(url, {
		'method': 'get',
		'onSuccess': function(r){
			Geocaching.lastAjaxId = null;
			delete(Geocaching.ajaxRequests[ajaxId]);

			var reply = r.responseText.replace(/\n/g, " ").replace(/\r/g, "").replace(/\t/g," ");

			if(!this.checkLogin(reply)) {
				this.doLogin(
					Geocaching.login['username'],
					Geocaching.login['password'], 
					function() {
						this.postLogLoad(params, success, failure);
					}.bind(this),
					failure
				);
				return false;
			}

			var logParams = {
				'viewstate': '',
				'viewstate1': '',
				'logTypes': [],
				'trackables': []
			};
			var i;

			// Log types
			var logTypesBegin = reply.search('ctl00_ContentBody_LogBookPanel1_ddLogType');
			if (-1 != logTypesBegin) {
	  		var logTypesSelect = reply.substr(logTypesBegin);
				var logTypesEnd = logTypesSelect.search('</select>');
				logTypesSelect = logTypesSelect.substr(0, logTypesEnd);
				var logTypes = logTypesSelect.split('<option');
				var logTypesCount = logTypes.length;
				var _logType;
				logParams['logTypes'] = new Array();
				for(i=1; i<logTypesCount; i++) {
					_logType = logTypes[i].match(/value="([^"]*)"/i)[1]
					if (_logType > 0) {
		  			logParams['logTypes'].push(_logType);
		  		}
				}
				delete(logTypes); delete(logTypesSelect);
			}
			
			// Viewstate
			logParams['viewstate'] = reply.match(/id="__VIEWSTATE"\s+value="(.+?)"/)[1]
			logParams['viewstate1'] = reply.match(/id="__VIEWSTATE1"\s+value="(.+?)"/)[1]

			// Trackables
			var trackablesBegin = reply.search('<table id="tblTravelBugs" class="LogTrackablesTable Table">');
			if (-1 != trackablesBegin) {
	  		var trackablesTable = reply.substr(trackablesBegin);
				var trackablesEnd = trackablesTable.search('</table>');
				trackablesTable = trackablesTable.substr(0, trackablesEnd);
				var trackables = trackablesTable.split('<tr id="');
				var trackablesCount = trackables.length;
				var _trackable, tmp;
				logParams['trackables'] = new Array();
				for(i=1; i<trackablesCount; i++) {
					try {
						_trackable = {};
						tmp = trackables[i].split('<td');
						_trackable['num'] = i;
						_trackable['choice'] = '';
						_trackable['name'] = tmp[2].match(/^>(.*)<\/td>/i)[1];
						_trackable['msid'] = trackables[i].match(/<select name="([^"]*)"/i)[1];
						_trackable['tracker'] = trackables[i].match(/\/track\/details\.aspx\?tracker=([^"]*)/i)[1];
						_trackable['id'] = trackables[i].match(/<option value="([0-9]+)">/i)[1];
		  			logParams['trackables'].push(_trackable);
					} catch(e) {
						Mojo.Log.error(Object.toJSON(e));
					}
				}
				delete(trackables); delete(trackablesTable); delete(tmp);
			}

			success(logParams);

		}.bind(this),
		'onFailure': function(r){
			failure($L("Error occured on fetching post log page."));
		},
		'onException': function(r){
			failure($L("Error occured on fetching post log page."));
		}

	});
	Geocaching.lastAjaxId = ajaxId;

	window.setTimeout(function(ajaxId, params, success, failure) {
		if(Ajax.activeRequestCount > 0 && ajaxId == Geocaching.lastAjaxId) {
			Geocaching.ajaxRequests[ajaxId].abort();
			delete(Geocaching.ajaxRequests[ajaxId]);

			if(params['retry']>1) {
				failure($L("Operation timeout"));
			} else {
				Mojo.Controller.getAppController().showBanner({'messageText': "Getting post log page failed, retrying ..."}, "", "postlog");
				params['retry']++;
				this.postLogLoad(params, success, failure);
			}
		}
	}.bind(this), timeout*1000, ajaxId, params, success, failure);
};

GeocachingCom.prototype.postLogSubmit = function(params, success, failure){
	var url = 'http://www.geocaching.com/seek/log.aspx?ID='+ params['cacheid'];
	var now = new Date();
	var nowMonth = now.getMonth() +1;
	var nowDay = now.getDate();
	var nowYear = now.getFullYear();
	var nowLogged = nowMonth +'/'+ nowDay +'/' + nowYear;
	
	var parameters = {
		'__EVENTTARGET': '',
		'__EVENTARGUMENT': '',
		'__LASTFOCUS': '',
		'__VIEWSTATEFIELDCOUNT':'2',
		'__VIEWSTATE': params['viewstate'],
		'__VIEWSTATE1': params['viewstate1'],
		'ctl00$ContentBody$LogBookPanel1$ddLogType': params['logType'],
		'ctl00$ContentBody$LogBookPanel1$DateTimeLogged': nowLogged,
		'ctl00$ContentBody$LogBookPanel1$DateTimeLogged$Month': nowMonth,
		'ctl00$ContentBody$LogBookPanel1$DateTimeLogged$Day': nowDay,
		'ctl00$ContentBody$LogBookPanel1$DateTimeLogged$Year': nowYear,
		'ctl00$ContentBody$LogBookPanel1$uxLogInfo': params['body'],
		'ctl00$ContentBody$LogBookPanel1$uxTrackables$hdnSelectedActions': '',
		'ctl00$ContentBody$LogBookPanel1$uxTrackables$hdnCurrentFilter': '',
		'ctl00$ContentBody$LogBookPanel1$LogButton': 'Submit Log Entry',
		'ctl00$ContentBody$uxVistOtherListingGC': ''
	}

	var z, trackablesCount = params['trackables'].length, _trName, _trValue;
	for(z=0; z<trackablesCount; z++) {
		_trName = params['trackables'][z]['msid'];
		_trValue = params['trackables'][z]['choice'];
		if(_trValue != '') {
			_trValue = params['trackables'][z]['id'] +'_'+ _trValue;
			parameters[_trName] = _trValue;
			parameters['ctl00$ContentBody$LogBookPanel1$uxTrackables$hdnSelectedActions'] += _trValue +',';
		}
	}

	var timeout = Geocaching.settings['secondTimeout']; // Always use longer timeout
	if(typeof(params['retry']) == 'undefined') {
		params['retry'] = 1;
	}
	
	var ajaxId = 'postlog-post-'+ params['cacheid'] +'-'+ Math.round(new Date().getTime());
	Geocaching.ajaxRequests[ajaxId] = new Ajax.Request(url, {
		'method': 'post',
		'parameters': parameters,
		'contentType': 'application/x-www-form-urlencoded',
		'onSuccess': function(r){
			Geocaching.lastAjaxId = null;
			delete(Geocaching.ajaxRequests[ajaxId]);

			var reply = r.responseText.replace(/\n/g, " ").replace(/\r/g, "").replace(/\t/g," ");
			
			if(-1 != reply.search('An Error Has Occurred')) {
				failure($L("Error occured in log posting."));
				return false;
			}

			success();			
		}.bind(this),
		'onFailure': function(r){
			failure($L("Error occured in log posting."));
		},
		'onException': function(r){
			failure($L("Error occured in log posting."));
		}

	});
	Geocaching.lastAjaxId = ajaxId;

	window.setTimeout(function(ajaxId, params, success, failure) {
		if(Ajax.activeRequestCount > 0 && ajaxId == Geocaching.lastAjaxId) {
			Geocaching.ajaxRequests[ajaxId].abort();
			delete(Geocaching.ajaxRequests[ajaxId]);

			if(params['retry']>1) {
				failure($L("Operation timeout"));
			} else {
				Mojo.Controller.getAppController().showBanner({'messageText': "Sending log failed, retrying ..."}, "", "postlog");
				params['retry']++;
				this.postLogSubmit(params, success, failure);
			}
		}
	}.bind(this), timeout*1000, ajaxId, params, success, failure);
};

/**
 * Load parameters from "Post a New Log" page of Trackable
 * 
 * @param {Object} params Request parameters
 * @param {Function} success Function to lauch after success
 * @param {Function} failure Function to lauch after any failure
 */
GeocachingCom.prototype.postLogTrackableLoad = function(params, success, failure)
{
	var url = 'http://www.geocaching.com/track/log.aspx?wid='+ params['guid'];
	var timeout = Geocaching.settings['firstTimeout'];
	if(typeof(params['retry']) != 'undefined' && params['retry']>1) {
		var timeout = Geocaching.settings['secondTimeout'];
	} else {
		params['retry'] = 1;
	}

	Mojo.Log.info(url);

	var ajaxId = 'postlogt-get-'+ params['guid'] +'-'+ Math.round(new Date().getTime());
	Geocaching.ajaxRequests[ajaxId] = new Ajax.Request(url, {
		'method': 'get',
		'onSuccess': function(r){
			Geocaching.lastAjaxId = null;
			delete(Geocaching.ajaxRequests[ajaxId]);

			var reply = r.responseText.replace(/\n/g, " ").replace(/\r/g, "").replace(/\t/g," ");

			if(!this.checkLogin(reply)) {
				this.doLogin(
					Geocaching.login['username'],
					Geocaching.login['password'], 
					function() {
						this.postLogTrackableLoad(params, success, failure);
					}.bind(this),
					failure
				);
				return false;
			}

			var logParams = {
				'viewstate': '',
				'viewstate1': '',
				'logTypes': []
			};
			var i;

			// Log types
			var logTypesBegin = reply.search('ctl00_ContentBody_LogBookPanel1_ddLogType');
			if (-1 != logTypesBegin) {
	  		var logTypesSelect = reply.substr(logTypesBegin);
				var logTypesEnd = logTypesSelect.search('</select>');
				logTypesSelect = logTypesSelect.substr(0, logTypesEnd);
				var logTypes = logTypesSelect.split('<option');
				var logTypesCount = logTypes.length;
				var _logType;
				logParams['logTypes'] = new Array();
				for(i=1; i<logTypesCount; i++) {
					_logType = logTypes[i].match(/value="([^"]*)"/i)[1]
					if (_logType > 0) {
		  			logParams['logTypes'].push(_logType);
		  		}
				}
				delete(logTypes); delete(logTypesSelect);
			}
			
			// Viewstate
			logParams['viewstate'] = reply.match(/id="__VIEWSTATE"\s+value="(.+?)"/)[1]
			logParams['viewstate1'] = reply.match(/id="__VIEWSTATE1"\s+value="(.+?)"/)[1]

			success(logParams);
		}.bind(this),
		'onFailure': function(r){
			failure($L("Error occured on fetching post log page."));
		},
		'onException': function(r){
			failure($L("Error occured on fetching post log page."));
		}

	});
	Geocaching.lastAjaxId = ajaxId;

	window.setTimeout(function(ajaxId, params, success, failure) {
		if(Ajax.activeRequestCount > 0 && ajaxId == Geocaching.lastAjaxId) {
			Geocaching.ajaxRequests[ajaxId].abort();
			delete(Geocaching.ajaxRequests[ajaxId]);

			if(params['retry']>1) {
				failure($L("Operation timeout"));
			} else {
				Mojo.Controller.getAppController().showBanner({'messageText': "Getting post log page failed, retrying ..."}, "", "postlog");
				params['retry']++;
				this.postLogTrackableLoad(params, success, failure);
			}
		}
	}.bind(this), timeout*1000, ajaxId, params, success, failure);
};

GeocachingCom.prototype.postLogTrackablesSubmit = function(params, success, failure){
	var url = 'http://www.geocaching.com/track/log.aspx?wid='+ params['guid'];
	var now = new Date();
	var nowMonth = now.getMonth() +1;
	var nowDay = now.getDate();
	var nowYear = now.getFullYear();
	var nowLogged = nowMonth +'/'+ nowDay +'/' + nowYear;
	
	var parameters = {
		'__EVENTTARGET': '',
		'__EVENTARGUMENT': '',
		'__LASTFOCUS': '',
		'__VIEWSTATEFIELDCOUNT':'2',
		'__VIEWSTATE': params['viewstate'],
		'__VIEWSTATE1': params['viewstate1'],
		'ctl00$ContentBody$LogBookPanel1$ddLogType': params['logType'],
		'ctl00$ContentBody$LogBookPanel1$tbCode': params['trackingCode'],
		'ctl00$ContentBody$LogBookPanel1$DateTimeLogged': nowLogged,
		'ctl00$ContentBody$LogBookPanel1$DateTimeLogged$Month': nowMonth,
		'ctl00$ContentBody$LogBookPanel1$DateTimeLogged$Day': nowDay,
		'ctl00$ContentBody$LogBookPanel1$DateTimeLogged$Year': nowYear,
		'ctl00$ContentBody$LogBookPanel1$uxLogInfo': params['body'],
		'ctl00$ContentBody$uxVistOtherListingGC': '',
		'ctl00$ContentBody$LogBookPanel1$LogButton': 'Submit Log Entry'
	}

	var timeout = Geocaching.settings['secondTimeout']; // Always use longer timeout
	if(typeof(params['retry']) == 'undefined') {
		params['retry'] = 1;
	}
	
	var ajaxId = 'postlog-post-'+ params['cacheid'] +'-'+ Math.round(new Date().getTime());
	Geocaching.ajaxRequests[ajaxId] = new Ajax.Request(url, {
		'method': 'post',
		'parameters': parameters,
		'contentType': 'application/x-www-form-urlencoded',
		'onSuccess': function(r){
			Geocaching.lastAjaxId = null;
			delete(Geocaching.ajaxRequests[ajaxId]);

			var reply = r.responseText.replace(/\n/g, " ").replace(/\r/g, "").replace(/\t/g," ");
			
			if(-1 != reply.search('An Error Has Occurred')) {
				failure($L("Error occured in log posting."));
				return false;
			}
			
			if(-1 != reply.search('Sorry. The tracking number does not match for this trackable.')) {
				failure($L("The tracking number does not match for this trackable."));
				return false;
			}

			success();			
		}.bind(this),
		'onFailure': function(r){
			failure($L("Error occured in log posting."));
		},
		'onException': function(r){
			failure($L("Error occured in log posting."));
		}

	});
	Geocaching.lastAjaxId = ajaxId;

	window.setTimeout(function(ajaxId, params, success, failure) {
		if(Ajax.activeRequestCount > 0 && ajaxId == Geocaching.lastAjaxId) {
			Geocaching.ajaxRequests[ajaxId].abort();
			delete(Geocaching.ajaxRequests[ajaxId]);

			if(params['retry']>1) {
				failure($L("Operation timeout"));
			} else {
				Mojo.Controller.getAppController().showBanner({'messageText': "Sending log failed, retrying ..."}, "", "postlog");
				params['retry']++;
				this.postLogSubmit(params, success, failure);
			}
		}
	}.bind(this), timeout*1000, ajaxId, params, success, failure);
};


GeocachingCom.prototype.ownedFinds = function(success, failure)
{
	var timeout = Geocaching.settings['secondTimeout'];
	var url = "http://www.geocaching.com/my/owned.aspx";
	var ajaxId = 'owned-'+ Math.round(new Date().getTime());
	Geocaching.ajaxRequests[ajaxId] = new Ajax.Request(url, {
		'method': 'get',
		'onSuccess': function(r){
			Geocaching.lastAjaxId = null;
			delete(Geocaching.ajaxRequests[ajaxId]);

			var reply = r.responseText.replace(/\n/g, " ").replace(/\r/g, "").replace(/\t/g," ");
			
			if(!this.checkLogin(reply)) {
				this.doLogin(
					Geocaching.login['username'],
					Geocaching.login['password'], 
					function() {
						this.ownedFinds(success, failure);
					}.bind(this),
					failure
				);
				return false;
			}
			
			var owBegin = reply.search('<table class="Table">');
			var owList, owEnd, owItems, owCount, guid;
			if(-1 != owBegin) {
				owList = reply.substr(owBegin);
				owEnd = owList.search('</table>');
				owList = owList.substr(0, owEnd);
				owItems = owList.split('<tr');
				owCount = owItems.length-1;
				for(var z=2; z<=owCount; z++) {
					guid = owItems[z].match(/cache_details.aspx\?guid=([\w-]+)/)[1];
					Geocaching.ownfinds[guid]=2;
				}
			}
			var url = "http://www.geocaching.com/my/logs.aspx?s=1";
			var ajaxId = 'finds-'+ Math.round(new Date().getTime());
			Geocaching.ajaxRequests[ajaxId] = new Ajax.Request(url, {
				'method': 'get',
				'onSuccess': function(r){
					Geocaching.lastAjaxId = null;
					delete(Geocaching.ajaxRequests[ajaxId]);
					var reply = r.responseText.replace(/\n/g, " ").replace(/\r/g, "").replace(/\t/g," ");
					var foBegin = reply.search('<table class="Table">');
					var foList, foEnd, foItems, foCount, guid;
					if(-1 != foBegin) {
						foList = reply.substr(foBegin);
						foEnd = foList.search('</table>');
						foList = foList.substr(0, foEnd);
						foItems = foList.split('<tr');
						foCount = foItems.length-1;
						for(var z=1; z<=foCount; z++) {
							try {
								guid = foItems[z].match(/logtypes\/(2|10)\.png.+cache_details.aspx\?guid=([\w-]+)/)[2];
								Geocaching.ownfinds[guid]=1;
							} catch(e) {}
						}
					}
					Mojo.Log.info('Anzahl:'+Object.keys(Geocaching.ownfinds).length);
					success();
				},
				'onFailure': function(r){
					failure($L("Error reading found caches."));
				},
				'onException': function(r){
					failure($L("Exception reading found caches."));
				}
			});
		}.bind(this),
		'onFailure': function(r){
			Mojo.Log.error(Object.toJSON(r));
			failure($L("Error reading owned caches."));
		},
		'onException': function(r){
			Mojo.Log.error(Object.toJSON(r));
			failure($L("Exception reading owned caches."));
		}
	});
	Geocaching.lastAjaxId = ajaxId;

	window.setTimeout(function(ajaxId, params, success, failure) {
		if(Ajax.activeRequestCount > 0 && ajaxId == Geocaching.lastAjaxId) {
			Geocaching.ajaxRequests[ajaxId].abort();
			delete(Geocaching.ajaxRequests[ajaxId]);
			failure($L("Operation timeout"));
		}
	}.bind(this), timeout*1000, ajaxId, success, failure);
};


