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

	this.inputs['bycoordsnum'] = this.modelActionByCoordsNum['value'] = "10";
	this.controller.modelChanged(this.modelActionByCoordsNum);
	
	this.actionByCoordsClicked = this.actionByCoordsClicked.bind(this);
	Mojo.Event.listen(this.controller.get('action-button-bycoords'), Mojo.Event.tap, this.actionByCoordsClicked);

	
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
	this.setProgress(10);
	this.setStatus('A');
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
	Mojo.Log.error('downloadList');
	this.cacheList = result.cacheList;
	this.downloadNext();
};

OfflineAssistant.prototype.downloadNext = function () {
	this.setProgress(Math.round((this.dlnumtotal-this.dlnum)*100/this.dlnumtotal));
	if (this.dlnum == 0) {
		this.controller.get('load').hide();
		this.showPopup(null, $L("Download"), $L("Download complete"), function() { this.controller.get('actions').show(); });
		return;
	}
	var len = this.cacheList.length;
	Mojo.Log.error('Len:'+len);
	if (len>0) {
		Mojo.Log.error('Len2:'+len);
		var dlc=this.cacheList.shift();
		this.dlnum--;
		this.geocode=dlc['gccode'];
		this.setStatus(this.geocode);
		Mojo.Log.error('Len:'+len+' GC:'+this.geocode+' Rest:'+this.dlnum);
		Geocaching.accounts['geocaching.com'].loadCache({
				'geocode': this.geocode
			},
			function(geocode) {
				var ts = Math.round(new Date().getTime() / 1000);
				cache[geocode].updated = ts;
				Mojo.Log.error('Got:'+geocode);
				this.guid = cache[geocode].guid;

				var query = 'INSERT INTO "caches"("gccode", "guid", "updated", "found", "latitude", "longitude", "json") VALUES ("'+
					escape(geocode) + '", "' + 
					escape(cache[geocode].guid) + '", ' + 
					escape(ts) + ', ' +
					escape(cache[geocode].found?1:0) + ', ' +
					escape(cache[geocode].latitude) + ', ' +
					escape(cache[geocode].longitude) + ', "' +  
					escape(Object.toJSON(cache[geocode])) +'"); GO;';
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
			function(message) {
				delete(cache[this.geocode]);
				this.controller.get('loading-spinner').hide();
				this.showPopup(null, $L("Problem"), message, function() { Mojo.Controller.stageController.popScene(); });
				return false;
			}.bind(this)
		);
	}

};


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
