function OfflineAssistant() {
}


OfflineAssistant.prototype.setup = function() {
	this.inputs = {
		'bycoordslat': '',
		'bycoordslon': '',
		'bycoordsnum': '10',
	};
	this.controller.setupWidget('spinner',
		this.spinnerLAttrs = {
			'spinnerSize': 'large'
		},
		this.spinnerModel = {
			'spinning': true
		}
	);
	/* Search by Coordinates */
	this.controller.setupWidget('action-bycoordslat',
		this.attributesActionByCoorsLat = {
			'hintText': '',
			'textFieldName':  'name',
			'multiline':              false,
			'textReplacement': false,
			'maxLength': 20
		},
		this.modelActionByCoorsLat = {
			'value' : '',
			'disabled': false
		}
	);

	this.controller.setupWidget('action-bycoordslon',
		this.attributesActionByCoorsLon = {
			'hintText': '',
			'textFieldName':  'name',
			'multiline':              false,
			'textReplacement': false,
			'maxLength': 20
		},
		this.modelActionByCoorsLon = {
			'value' : '',
			'disabled': false
		}
	);
	this.controller.setupWidget('action-bycoordsnum',
		this.attributesActionByCoordsNum = {
			'hintText': '',
			'textFieldName':  'name',
			'multiline':              false,
			'textReplacement': false,
			'maxLength': 3
		},
		this.modelActionByCoordsNum = {
			'value' : '',
			'disabled': false
		}
	);
	this.controller.setupWidget('action-button-bycoords', {},
		{
			'label': $L("Download"),
			'buttonClass': "palm-button buttonfloat primary",
			'disabled': false
		}
	);
	
	// Owns & Finds
	this.controller.setupWidget('action-button-ownfinds', {},
		{
			'label': $L("Download"),
			'buttonClass': "palm-button buttonfloat primary",
			'disabled': false
		}
	);

	this.inputs['bycoordsnum'] = this.modelActionByCoordsNum['value'] = "10";
	this.controller.modelChanged(this.modelActionByCoordsNum);
	
	this.actionByCoordsClicked = this.actionByCoordsClicked.bind(this);
	Mojo.Event.listen(this.controller.get('action-button-bycoords'), Mojo.Event.tap, this.actionByCoordsClicked);
	this.actionOwnfindsClicked = this.actionOwnfindsClicked.bind(this);
	Mojo.Event.listen(this.controller.get('action-button-ownfinds'), Mojo.Event.tap, this.actionOwnfindsClicked);

	
	Geocaching.storage.simpleGet('inputs', function(response) {
		var size = Object.values(response).size();
		if(1 <= size) {
			if(typeof(response.bycoordslat)!='undefined') {
				this.inputs['bycoordslat'] = this.modelActionByCoorsLat['value'] = Geocaching.toLatLon(response.bycoordslat,'lat');
				this.controller.modelChanged(this.modelActionByCoorsLat);
			}
			
			if(typeof(response.bycoordslon)!='undefined') {
				this.inputs['bycoordslon'] = this.modelActionByCoorsLon['value'] = Geocaching.toLatLon(response.bycoordslon,'lon');
				this.controller.modelChanged(this.modelActionByCoorsLon);
			}
		}
	}.bind(this), function () {});
	
	
}


OfflineAssistant.prototype.activate = function(event) {
}

OfflineAssistant.prototype.deactivate = function(event) {
}

OfflineAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('action-button-bycoords'), Mojo.Event.tap, this.actionByCoordsClicked);
	Mojo.Event.stopListening(this.controller.get('action-button-ownfinds'), Mojo.Event.tap, this.actionOwnfindsClicked);
}

OfflineAssistant.prototype.showProgress = function()
{
	this.controller.get('progress-bar').style.width = '0%';
	this.controller.get('progress').style.display = "";
};
OfflineAssistant.prototype.hideProgress = function()
{
	this.controller.get('progress').style.display = "none";
	this.controller.get('progress-bar').style.width = '0%';
};
OfflineAssistant.prototype.setProgress = function(percent)
{
	Mojo.Log.error('Bar:'+percent);
	this.controller.get('progress-bar').style.width = percent + '%';
};
OfflineAssistant.prototype.setStatus = function(tx)
{
	this.controller.get('spinnerStatus').innerHTML = tx;
};


OfflineAssistant.prototype.actionByCoordsClicked = function(event) {
	var lat = this.controller.get('action-bycoordslat').mojo.getValue();
	var lon = this.controller.get('action-bycoordslon').mojo.getValue();
	this.dlnum = this.controller.get('action-bycoordsnum').mojo.getValue();
	this.dlnumtotal = this.dlnum;
	var latitude = Geocaching.parseCoordinate(lat);
	var longitude = Geocaching.parseCoordinate(lon);
	if(latitude == false) {
		this.showPopup(null,$L("Coordinates"),$L("Unknown format of coordinates in Latitude."),null);
		return false;
	}
	if(longitude == false) {
		this.controller.showAlertDialog({
			'title': $L("Coordinates"),
			'message': $L("Unknown format of coordinates in Longitude."),
			'choices': [{
				'label': $L("Close"),
				'type':'primary'
			}]
		});
		return false;
	}
	this.controller.get('actions').hide();
	this.controller.get('load').show();
	this.showProgress();
	this.setProgress(0);
	this.page=1;
	this.pageleft=0;
	this.setStatus('Page '+this.page);
	Geocaching.accounts['geocaching.com'].searchByCoords({
		'latitude': latitude, 
		'longitude': longitude
	//	'cachetype': cacheIDs['all'];
		},
		this.downloadList.bind(this),
		function(message) {
			this.controller.get('actions').hide();
			this.showPopup(null, $L("Problem"), message, function() { Mojo.Controller.stageController.popScene(); });
			return false;
		}.bind(this)
	);
	
};

OfflineAssistant.prototype.downloadList = function (result) {
	this.cacheList = result.cacheList;
	this.viewstate = result['viewstate'];
	this.url = result['url'];
	this.pageleft = result['pageleft'];
	this.downloadNext();
};

OfflineAssistant.prototype.downloadNextPage = function() {
	this.page++;
	this.setStatus('Page '+this.page);
	Geocaching.accounts['geocaching.com'].searchByUrlNextPage({
		'url': this.url,
		'viewstate': this.viewstate
//		'list': this.searchParameters['list']
		},
		this.downloadList.bind(this),
		function(message) {
			this.controller.get('loading-spinner').hide();
			this.showPopup(null, $L("Problem"), message, function() { Mojo.Controller.stageController.popScene(); });
			return false;
		}.bind(this)
	);
}


OfflineAssistant.prototype.downloadNext = function () {
	this.setProgress(Math.round((this.dlnumtotal-this.dlnum)*100/this.dlnumtotal));
	if (this.dlnum == 0) {
		this.controller.get('load').hide();
		this.showPopup(null, $L("Download"), $L("Download complete"), function() { this.controller.get('actions').show(); });
		return;
	}
	var len = this.cacheList.length;
//	Mojo.Log.error('Len:'+len);
	if (len>0) {
//		Mojo.Log.error('Len2:'+len);
		var dlc=this.cacheList.shift();
		this.dlnum--;
		this.geocode=dlc['gccode'];
		this.setStatus(this.geocode);
		Mojo.Log.error('Len:'+len+' GC:'+this.geocode+' Rest:'+this.dlnum);
		Geocaching.accounts['geocaching.com'].loadCache({
				'geocode': this.geocode,
				'logcount': 0
			},
			function(geocode) {
				var ts = Math.round(new Date().getTime() / 1000);
				cache[geocode].updated = ts;
				Mojo.Log.error('Got:'+geocode);
				this.guid = cache[geocode].guid;
				var logs=cache[this.geocode].logs;
				delete(cache[this.geocode].logs);
				var query = 'INSERT INTO "caches"("gccode", "guid", "updated", "found", "latitude", "longitude", "json", "logs") VALUES ("'+
					escape(geocode) + '", "' + 
					escape(cache[geocode].guid) + '", ' + 
					escape(ts) + ', ' +
					escape(cache[geocode].found?1:0) + ', ' +
					escape(cache[geocode].latitude) + ', ' +
					escape(cache[geocode].longitude) + ', "' +  
					escape(Object.toJSON(cache[this.geocode])) +'","'+
					escape(Object.toJSON(logs))+ '"); GO;';

//					Mojo.Log.info(query);
					this.geocode=geocode;
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

				this.downloadNext();
			}.bind(this),
/*			function(geocode) {
				// Save Logs
				var query = 'UPDATE "caches" set "logs"="'+escape(Object.toJSON(cache[geocode].logs))+'" WHERE "gccode"="'+escape(geocode)+'"; GO;';
//				Mojo.Log.info('Save logs:'+geocode+query);
				Geocaching.db.transaction( 
					(function (transaction) { 
						transaction.executeSql(query, [], 
							function() {},
							function() {}
						);
					}).bind(this)
				);
				delete(cache[this.geocode]);
			}.bind(this), */
			function() {},
			function(message) {
				// On Error Skip and try next cache
				delete(cache[this.geocode]);
				this.downloadNext();
			}.bind(this)
		);
	} else if (this.pageleft > 0) {
		this.downloadNextPage();
	} else  {
		this.controller.get('load').hide();
		this.showPopup(null, $L("Download"), $L("No more caches to Download"), function() { this.controller.get('actions').show(); });
		return;
	}
};


OfflineAssistant.prototype.actionOwnfindsClicked = function(event) {
	this.hideProgress();
	this.controller.get('actions').hide();
	this.setStatus('Hides & Finds');
	this.controller.get('load').show();
	Geocaching.accounts['geocaching.com'].ownedFinds(
		this.actionOwnfindsFinished.bind(this),
		function(message) {
				delete(cache[this.geocode]);
				this.controller.get('load').hide();
				this.showPopup(null, $L("Problem"), message, function() { Mojo.Controller.stageController.popScene(); });
				return false;
			}.bind(this)
	);

}

OfflineAssistant.prototype.actionOwnfindsFinished = function () {

	this.controller.get('load').hide();
	this.showPopup(null, $L("Download"), $L("Download complete"), function() { this.controller.get('actions').show(); });
	try {
		Geocaching.storage.simpleAdd('ownfinds', Geocaching.ownfinds,
			function() {}.bind(this),
			function() {}.bind(this)
		);
	} catch(e) { }

}


OfflineAssistant.prototype.showPopup = function(event, title, message, onChoose) {
	if(typeof(onChoose) != 'function') {
		onChoose = function() {}
	}
	this.controller.showAlertDialog({
		'onChoose': onChoose,
		'title': title,
		'message': message,
		'choices':[ {'label':$L("Close"), 'value':'close', 'type':'negative'} ]
	});
}
