function MapCacheAssistant(params, sceneAssistant,callbackFunc,exitFunc) {
	this.gccode = params['gccode'];
	this.cacheName = params['cacheName'];
	this.cacheType = params['cacheType'];
	this.cacheId = params['cacheId'];
	this.cacheDisabled = params['cacheDisabled'];
	this.cacheLocation = params['cacheLocation'];
	this.userLocation = params['userLocation'];
	this.userToken = params['userToken'];
	this.callbackFunc = callbackFunc;
	this.exitFunc = exitFunc;
	this.sceneAssistant = sceneAssistant;
	this.controller = sceneAssistant.controller;
}

MapCacheAssistant.prototype.setup = function(widget) {
	this.widget = widget;

	this.controller.get('gccode').update(this.gccode);
	this.controller.get('title').update('<img class="gc-icon" src="images/'+ cacheTypesNumbers[this.cacheType] +'.gif" /> '+ this.cacheName);

	if(this.cacheDisabled) {
		this.controller.get('title').className += ' gc-disabled';
	}
	
	var cacheDistance = Geocaching.getDistance(this.cacheLocation['lat'], this.cacheLocation['lon'], this.userLocation['lat'], this.userLocation['lon']);
	this.controller.get('navigate').update($L("Navigate (#{distance})").interpolate({'distance': Geocaching.getHumanDistance(cacheDistance)}));
	
	this.detail = this.detail.bind(this);
	Mojo.Event.listen(this.controller.get('detail'),Mojo.Event.tap, this.detail);

	this.close = this.close.bind(this);
	Mojo.Event.listen(this.controller.get('close'),Mojo.Event.tap, this.close);

	// Load cache detail
	if (Geocaching.db != null) {
		var item = [];
		Geocaching.db.transaction( 
			(function (transaction) {
				transaction.executeSql('select * from "caches" where "gccode"= ?;', [this.gccode],
					function(transaction, results) {
						try {
							var caches = results.rows.length;
							if(caches == 0) throw("Not in database");
							delete(caches);

							item = results.rows.item(0);

							cache[this.gccode] = unescape(item['json']).evalJSON();

							try {
								cache[this.gccode].userdata = unescape(item['userdata']).evalJSON();
							} catch(e) {
								cache[this.gccode].userdata = {};
							}
							
							try {
								if(item['found'] == 1)
									cache[this.gccode].found = true;
							} catch(e) {}

							try {
								if(item['favourite'] == 1)
									cache[this.gccode].favourite = true;
							} catch(e) {}

							cache[this.gccode].updated = item['updated'];

							if(typeof(cache[this.gccode].guid) == 'undefined')
								throw("loadit")

							this.showCacheDetail();
						} catch(e) {
							Mojo.Log.error(Object.toJSON(e));
							this.reloadCache();
						}
					}.bind(this)
				); 
			}).bind(this) 
		);
	} else {
		this.reloadCache();
	}
	
}

MapCacheAssistant.prototype.activate = function(event) {
};

MapCacheAssistant.prototype.deactivate = function(event) {
};

MapCacheAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('close'),Mojo.Event.tap,this.close);
	this.exitFunc();
};

MapCacheAssistant.prototype.detail = function(event) {
	var gccode = this.gccode;
	var appController = Mojo.Controller.getAppController();
	var f = function(stageController){
		stageController.pushScene('cache', gccode);
	};
	appController.createStageWithCallback({
		'name': 'cache'+gccode,
		'lightweight': true
	}, f, 'card');
	this.widget.mojo.close();
};

MapCacheAssistant.prototype.close = function(event) {
	this.widget.mojo.close();
};

MapCacheAssistant.prototype.navigate = function(event) {
	this.callbackFunc(
/*		this.controller.get('wptName').mojo.getValue(),
		this.controller.get('latitude').mojo.getValue(),
		this.controller.get('longitude').mojo.getValue()*/
	);
	this.widget.mojo.close();
};

MapCacheAssistant.prototype.reloadCache = function() {
	var params = {
		'token': this.userToken,
		'id': this.cacheId
	};

	Geocaching.accounts['geocaching.com'].loadCacheDetailOnMap(params, function(data) {
		// Fill cache template container
		cache[this.gccode] = Object.clone(cacheTemplate);
		try {
			cache[this.gccode].size = data['cz'].match(/<img src=".*\/images\/icons\/container\/[a-z_]+.gif" alt="Size: ([^"]+)"/i)[1]
		} catch(e) {
			cache[this.gccode].size = 'Not chosen';
			Mojo.Log.error(Object.toJSON(e));
		}
		try {
			cache[this.gccode].terrain = data['t'].match(/<img src=\"(http:\/\/([\-0-9\.a-z\/]*)?www\.geocaching\.com)?\/images\/stars\/stars([0-9_]+)\.gif"/i)[3].replace("_", ".")
		} catch(e) {
			cache[this.gccode].terrain = "0";
		}
		try {
			cache[this.gccode].difficulty =  data['d'].match(/<img src=\"(http:\/\/([\-0-9\.a-z\/]*)?www\.geocaching\.com)?\/images\/stars\/stars([0-9_]+)\.gif"/i)[3].replace("_", ".")
		} catch(e) {
			cache[this.gccode].difficulty = "0";
		}

		this.showCacheDetail();
	}.bind(this), function() {	});
};

MapCacheAssistant.prototype.showCacheDetail = function() {
	this.controller.get('cache-size').src='images/'+ (cacheSizes[cache[this.gccode].size]?cacheSizes[cache[this.gccode].size]:'other') + '.gif';
	this.controller.get('cache-size-label').update($L(cache[this.gccode].size));
	this.controller.get('cache-terrain').src='images/stars'+ cache[this.gccode].terrain.replace('.', '_') + '.gif';
	this.controller.get('cache-terrain-label').update(cache[this.gccode].terrain);
	this.controller.get('cache-difficulty').src='images/stars'+ cache[this.gccode].difficulty.replace('.', '_') + '.gif';
	this.controller.get('cache-difficulty-label').update(cache[this.gccode].difficulty);
	this.controller.get('list').className = 'palm-list loaded';
}



