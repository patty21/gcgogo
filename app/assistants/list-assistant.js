function ListAssistant(searchMethod, parameters) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.searchMethod = searchMethod;
	this.searchParameters = parameters;
	this.searchResult = null;
	this.compass = null;
}

ListAssistant.prototype.setup = function() {

	/* this function is for setup tasks that have to happen when the scene is first created */
	this.loaded = false;
	this.backgroundMapGenerated = false;
	this.viewstate = null;
	this.userToken = null;
	this.dst = 0;
	this.sceneTitle = $L("Cache List");
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	//this.controller.stageController.setWindowOrientation('free');
	/* setup widgets here */
	this.controller.setupWidget('loading-spinner', 
		this.spinnerLAttrs = {
			'spinnerSize': 'large'
		},
		this.spinnerModel = {
			'spinning': true
		}
	);

	var swipe = (this.searchMethod == 'favourite' || this.searchMethod == 'fieldnotes');
	if(swipe == false) {
		try {
			swipe = this.searchParameters['url'].match(/^\-/);
		} catch(e) { }
	}

	this.controller.setupWidget("cache-list",
		this.attributes = {
			'itemTemplate': 'list/list-item',
			'listTemplate': 'list/list-container',
			'emptyTemplate': 'list/list-empty',
			'addItemLabel': $L("Extend list"),
			'swipeToDelete': swipe
		},
		this.cacheListModel = {
			'listTitle': $L("Caches"),
			'items' : []
		}
	);

	/* Main Menu */
	this.appMenuModel = {
		'visible': true,
		'items': [
			Mojo.Menu.editItem,
			{ 'label': $L({'value': "Show targets in Mapping Tool", 'key': 'show_targets_in_mapping_tool'}), 'command': 'mappingtool'},
		]
	};
	this.controller.setupWidget(Mojo.Menu.appMenu, {'omitDefaultItems': true}, this.appMenuModel);
	this.controller.setupWidget(Mojo.Menu.commandMenu, {'menuClass': 'no-fade'},
		this.commandMenuModel = {
			'items':	[
				( gcGogo.isTouchpad() ? 
					{'items': [
						{'label': $L("Back"), 'icon': 'back', 'command': 'goback'}
					]} : {}),
				((this.searchMethod == 'coords' || this.searchMethod == 'favourite')?
				{'items': [
					{'label': $L("Show on map"), 'iconPath': defaultnavigationIcons['mappingtool'], 'command': 'mappingtool'}
				]} : ( this.searchMethod == 'fieldnotes'
					? {'items': [
						{'label': $L("Export"), 'icon': 'send', 'command': 'export'}
					]}
					: {}))
			]}
	);
	
	/* add event handlers to listen to events from widgets */
	this.handleCacheListTap = this.handleCacheListTap.bindAsEventListener(this);
	Mojo.Event.listen(this.controller.get('cache-list'),Mojo.Event.listTap, this.handleCacheListTap);

	this.handleNextPage = this.handleNextPage.bind(this);
	Mojo.Event.listen(this.controller.get('cache-list'),Mojo.Event.listAdd, this.handleNextPage);

	this.handleDeleteItem = this.handleDeleteItem.bind(this);
	Mojo.Event.listen(this.controller.get('cache-list'),Mojo.Event.listDelete, this.handleDeleteItem);

	this.sceneTitle = '';

	switch(this.searchMethod) {
		case 'nextpage':
			this.sceneTitle = this.searchParameters['title'];
			var tmp = '';
			if(tmp = this.searchParameters['url'].match(/^\-favourites\-(\d+)$/)) {
				// Favourites - next page
				this.loadFavourites({
						'page': Number(tmp[1]) +1
					},
					this.buildList.bind(this),
					function(message) {
						this.controller.get('loading-spinner').hide();
						this.showPopup(null, $L("Problem"), message, function() { Mojo.Controller.stageController.popScene(); });
						return false;
					}.bind(this)
				);
			} else if(tmp = this.searchParameters['url'].match(/^\-fieldnotes\-(\d+)$/)) {
				// Field Notes - next page
				this.loadFieldNotes({
						'page': Number(tmp[1]) +1
					},
					this.buildList.bind(this),
					function(message) {
						this.controller.get('loading-spinner').hide();
						this.showPopup(null, $L("Problem"), message, function() { Mojo.Controller.stageController.popScene(); });
						return false;
					}.bind(this)
				);
			} else {
				// Search by URL
				Geocaching.accounts['geocaching.com'].searchByUrlNextPage({
						'url': this.searchParameters['url'],
						'viewstate': this.searchParameters['viewstate'],
						'list': this.searchParameters['list']
					},
					this.buildList.bind(this),
					function(message) {
						this.controller.get('loading-spinner').hide();
						this.showPopup(null, $L("Problem"), message, function() { Mojo.Controller.stageController.popScene(); });
						return false;
					}.bind(this)
				);
			}
		break;
		case 'keyword':
			this.sceneTitle = $L("Search by Keyword");
			Geocaching.accounts['geocaching.com'].searchByKeyword({
					'keyword': this.searchParameters['keyword'],
					'cachetype': this.searchParameters['tx']
				},
				this.buildList.bind(this),
				function(message) {
					this.controller.get('loading-spinner').hide();
					this.showPopup(null, $L("Problem"), message, function() { Mojo.Controller.stageController.popScene(); });
					return false;
				}.bind(this)
			);
		break;
		case 'coords':
			this.sceneTitle = $L("Search by Coordinates");
			Geocaching.accounts['geocaching.com'].searchByCoords({
					'latitude': this.searchParameters['lat'], 
					'longitude': this.searchParameters['lon'],
					'cachetype': this.searchParameters['tx']
				},
				this.buildList.bind(this),
				function(message) {
					this.controller.get('loading-spinner').hide();
					this.showPopup(null, $L("Problem"), message, function() { Mojo.Controller.stageController.popScene(); });
					return false;
				}.bind(this)
			);
		break;
		case 'username':
			this.sceneTitle = $L("Finds by #{name}").interpolate({'name': this.searchParameters['username']});
			Geocaching.accounts['geocaching.com'].searchByUsername({
					'username': this.searchParameters['username'],
					'cachetype': this.searchParameters['tx']
				},
				this.buildList.bind(this),
				function(message) {
					this.controller.get('loading-spinner').hide();
					this.showPopup(null, $L("Problem"), message, function() { Mojo.Controller.stageController.popScene(); });
					return false;
				}.bind(this)
			);
		break;
		case 'owner':
			this.sceneTitle = $L("Hidden by #{name}").interpolate({'name': this.searchParameters['username']});
			Geocaching.accounts['geocaching.com'].searchByOwner({
					'username': this.searchParameters['username'],
					'cachetype': this.searchParameters['tx']
				},
				this.buildList.bind(this),
				function(message) {
					this.controller.get('loading-spinner').hide();
					this.showPopup(null, $L("Problem"), message, function() { Mojo.Controller.stageController.popScene(); });
					return false;
				}.bind(this)
			);
		break;
		case 'favourite':
			this.sceneTitle = $L("Favourites");
			this.loadFavourites({
					'page': this.searchParameters['page']
				},
				this.buildList.bind(this),
				function(message) {
					this.controller.get('loading-spinner').hide();
					this.showPopup(null, $L("Problem"), message, function() { Mojo.Controller.stageController.popScene(); });
					return false;
				}.bind(this)
			);
		break;
		case 'fieldnotes':
			this.sceneTitle = $L("Field Notes");
			this.loadFieldNotes({
					'page': this.searchParameters['page']
				},
				this.buildList.bind(this),
				function(message) {
					this.controller.get('loading-spinner').hide();
					this.showPopup(null, $L("Problem"), message, function() { Mojo.Controller.stageController.popScene(); });
					return false;
				}.bind(this)
			);
		break;
		default:
			// searchMethod is not supported
			Mojo.Controller.stageController.popScene();
		break;
	}
	// Title
	this.controller.get('list-title').update(this.sceneTitle);
}

ListAssistant.prototype.activate = function(event) {
	// Enable recalculating timer
	if(this.loaded && Geocaching.settings['recalculatedistance']) {
		this.recalculateDistance();
	}
}

ListAssistant.prototype.deactivate = function(event) {
	if(Geocaching.settings['recalculatedistance']) {
		try {
			window.clearTimeout(this.recalculateDistanceTimeout);
		} catch(e) { }
		try {
			this.locationSearch.cancel();
		} catch(e) { }
	}
}

ListAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('cache-list'),Mojo.Event.listTap, this.handleCacheListTap);
	Mojo.Event.stopListening(this.controller.get('cache-list'),Mojo.Event.listAdd, this.handleNextPage);
	Mojo.Event.stopListening(this.controller.get('cache-list'),Mojo.Event.listDelete, this.handleDeleteItem);
}


ListAssistant.prototype.makeDist = function(dist) {
	var bne = Geocaching.simpleProjection(this.searchParameters['lat'],this.searchParameters['lon'],45,dist,0);
	var bsw = Geocaching.simpleProjection(this.searchParameters['lat'],this.searchParameters['lon'],225,dist,0);
	var par = {
		'token': this.userToken,
		'lat1': bsw['lat'],
		'lon1': bsw['lon'],
		'lat2': bne['lat'],
		'lon2': bne['lon']
	}
	Mojo.Log.error(Object.toJSON(par));
	return par;
}


ListAssistant.prototype.mapTool = function(res) {
	var reply = res.responseText;
//	Mojo.Log.error(reply);
	var caches = reply.evalJSON();
//	Mojo.Log.error('Caches');
		var len = caches.length;
//		Mojo.Log.error('Len:'+len);
		var item = {};
		var params = {'center':{
				'lat' : this.searchParameters['lat'], 
				'lon' : this.searchParameters['lon'], 
				'zoom': 14}
			   };
		params['app']=Mojo.Controller.appInfo.id;
		params['targets']=new Array();
		var imgurl = {
			'1' : 'http://www.geocaching.com/images/gmn/f.png',
			'2' : 'http://www.geocaching.com/images/silk/star.png'
		}
		
		for(var z = 0; z<len; z++) {
			item = {
				'lat':caches[z]['lat'],
				'lon':caches[z]['lon'],
				'name':caches[z]['name'],
				'gcid':caches[z]['gc'],
				'image':'http://www.geocaching.com/images/WptTypes/sm/'+caches[z]['typ']+'.gif'
			}

			if (Geocaching.ownfinds[caches[z]['guid']]!=undefined) {
				item['image'] = imgurl[Geocaching.ownfinds[caches[z]['guid']]];
			}
			params['targets'].push(Object.clone(item));
		}
	
//		Mojo.Log.error(Object.toJSON(params));			
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
}


ListAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.command) {
		switch(event.command)
		{
			case 'mappingtool':
			
			   if (this.searchMethod=='coords') {
			   	Mojo.Controller.getAppController().showBanner({'messageText': $L("Requesting map data ...")}, '', 'nearest');
			   	var url = "http://gc.yz.to/map.php?lat="+ this.searchParameters['lat'] +"&lon="+ this.searchParameters['lon'];
				if (Geocaching.login['geid']!=undefined) url+= "&GE="+Geocaching.login['geid'];
				var upAjax = new Ajax.Request(url, {
					'method': 'get',
					'onSuccess': this.mapTool.bind(this),
					'onFailure': function(r){}
				});
			   } else {

				var params = {
					'app': Mojo.Controller.appInfo.id
				};
				params['targets'] = new Array();
				var cacheList = this.searchResult.cacheList;
				var len = cacheList.length;
				var _cache, item = {};
				for(var z = 0; z<len; z++) {
					try {
						_cache = cacheList[z];
						if(_cache['latitude'] && _cache['longitude']) {
							item = {
								'lat': _cache['latitude'],
								'lon': _cache['longitude'],
								'name': _cache['name'],
								'image': 'http://www.geocaching.com/images/WptTypes/sm/'+_cache['type']+'.gif'
							};
							// Special icons
							if(_cache['found']) {
								item['image'] = 'http://www.geocaching.com/images/gmn/f.png';
							} else
							if(_cache['disabled'] || _cache['archived']) {
								item['image'] = 'http://www.geocaching.com/images/icons/icon_disabled.gif';
							}
							params['targets'].push(Object.clone(item));
						}
					} catch(e) { }
				};

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


				}







			break;
			case 'map':
				this.controller.stageController.pushScene(
					{
						'name': 'map',
						'disableSceneScroller': true
					}, {
						'latitude': this.searchParameters['lat'],
						'longitude': this.searchParameters['lon']
					}
				);
			break;
			case 'export':
				var data = FieldNotes.toString();
				this.showPopup(null, "Warning", "Posting to geocaching.com not yet working. Result is in error log.");
				break; // temporary disable geocaching posting, since it is not yet working properly
				Geocaching.accounts['geocaching.com'].postFieldNotes(data,
					function(){
						this.showPopup(null, "Done", "Field Notes successfully uploaded");
					}.bind(this),
					function(message){
						this.showPopup(null, "Error", message);
					}.bind(this)
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

ListAssistant.prototype.showPopup = function(event, title, message, onChoose) {
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

ListAssistant.prototype.handleCacheListTap = function(event) {
	if(typeof(event.item['gccode']) != 'undefined') {
		var item = event.item;
		if(item['type'] == 'waypoint') {
			// Direct to Compass
			if(Geocaching.settings['defaultnavigation'] == 'mappingtool') {
				var params = Geocaching.format4Maptool([
					{
						'title': item['name'],
						'latitude': item['latitude'],
						'longitude': item['longitude'],
						'wptType': 'waypoint',
						'type': item['type'],
					}
				]);
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
							'message': $L({'value': "This feature require external application 'Mapping Tool'. It can be downloaded from PreCentral.net Homebrew Directory.", 'key': 'mappingtool_failure'}),
							'choices': [ {label:$L("Close"), value:'close', type:'primary'} ]
						});
					}.bind(this)
				});
				return true;
			} else {
				// Open compass
				if(Geocaching.settings['compassInNewCard']) {
					var appController = Mojo.Controller.getAppController();
					var f = function(stageController){
						stageController.pushScene(
							{
								'name': 'compass',
								'disableSceneScroller': true
							}, {
								'title': item['name'],
								'latitude': item['latitude'],
								'longitude': item['longitude'],
								'waypoints': [{
									'title': item['name'],
									'latitude': item['latitude'],
									'longitude': item['longitude']
								}]
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
							'title': item['name'],
							'latitude': item['latitude'],
							'longitude': item['longitude'],
							'waypoints': [{
								'title': item['name'],
								'latitude': item['latitude'],
								'longitude': item['longitude']
							}]
						}
					);
				}
			}
		} else {
			// Cache detail
			this.controller.stageController.pushScene('cache', item['gccode']);
		}
	}
}

ListAssistant.prototype.handleNextPage = function(event) {
	this.controller.stageController.swapScene('list', 'nextpage', {
		'title': this.sceneTitle,
		'url': this.url,
		'list': this.list, 
		'lat': this.searchParameters['lat'], 
		'lon': this.searchParameters['lon'],
		'viewstate': this.viewstate});
}

ListAssistant.prototype.handleDeleteItem = function(event) {
	if(event.item['gccode']) {
		if (this.searchMethod == "favourites" || (this.searchMethod == "nextpage" && this.searchParameters['url'].match(/^\-favourites\-(\d+)$/))){
			// Set item as non-favourite
			Geocaching.db.transaction( 
				(function (transaction) {
					transaction.executeSql('UPDATE "caches" SET "favourite"=0 WHERE "gccode"="'+ escape(event.item['gccode']) +'";', []);
				}).bind(this)
			);
			// Remove item from cacheList (for recalculate distance)
			this.searchResult.cacheList.splice(this.cacheListModel.items.indexOf(event.item), 1);
			// Reenable distance recalculating
			if(Geocaching.settings['recalculatedistance']) {
				try {
					window.clearTimeout(this.recalculateDistanceTimeout);
				} catch(e) { }
				this.recalculateDistance();
			}
		} else { // field notes removes only note, not the cache from database
			FieldNotes.removeNote(event.index);
			this.searchResult.cacheList.splice(this.cacheListModel.items.indexOf(event.item), 1);
			// we don't have recalculateDistance here
		}
	}
}

ListAssistant.prototype.buildList = function(searchResult) {
	this.viewstate = searchResult['viewstate'];
	this.url = searchResult['url'];
	this.list = searchResult['cacheList']; 
	var items = new Array(), founds = new Array();
	var units = null;

	this.searchResult = searchResult;
	var cacheList = searchResult.cacheList;

	var len = cacheList.length;
	var z = 0;

	// Counts for user lists
	if(typeof(searchResult.offset) != 'undefined') {
		z = searchResult.offset;
		if(typeof(searchResult.limit) != 'undefined') {
			len = Math.min(len, searchResult.offset + searchResult.limit);
		}
	}

	var cids = new Array();
	var trackables, trksLen = 0, i;
	var allCoordsKnown = true;
	for(z; z<len; z++) {
		if(typeof(cacheList[z]['cacheid']) != 'undefined') {
			cids.push(cacheList[z]['cacheid']);
		}

		// If any trackables present, show icon
		trackables = '';
		try {
			trksLen = cacheList[z]['trackables'].length;
			if(trksLen) {
				for(i=0; i<trksLen; i++) {
					trackables = '<img src="images/trackables.gif" />';
				}
			}
		} catch(e) { }

		items.push({
			'guid': cacheList[z]['guid'],
			'name': cacheList[z]['name'],
			'gccode': cacheList[z]['gccode'],
			'type': cacheTypesShort[cacheList[z]['type']],
			'attrs': (cacheList[z]['attribs']?'<img src="images/'+cacheSizeImages[cacheList[z]['size']]+'.gif" /> ('+cacheList[z]['attribs']+')':'<img src="http://www.geocaching.com/ImgGen/seek/CacheInfo.ashx?v='+cacheList[z]['gsattr']+'" />'),
			'latitude': cacheList[z]['latitude'],
			'longitude': cacheList[z]['longitude'],	
			'distance': (typeof(cacheList[z]['distance'])!='undefined'?cacheList[z]['distance']:''),
			'direction': (typeof(cacheList[z]['direction'])!='undefined'?'<img src="images/compass_'+ cacheList[z]['direction'] +'.gif" />':''),
//			'ddattrs':(cacheList[z]['ddattr']?'<img src="http://www.geocaching.com/ImgGen/seek/CacheDir.ashx?k='+cacheList[z]['ddattr']+'" />':''),
			'disabled': (cacheList[z]['archived']?' gc-archived':(cacheList[z]['disabled']?' gc-disabled':'')),
			'found': (cacheList[z]['found']?' <img src="images/found.png" />':''),
			'own': (cacheList[z]['own']?' <img src="images/star.png" />':''),
			'maintenance': (cacheList[z]['maintenance']?' <img src="images/needsmaint.gif" />':''),
			'trackables': trackables,
			'members': (cacheList[z]['members']?' <img src="images/members_small.gif" />':''),
			'floppy': (Geocaching.gcids[cacheList[z]['gccode']]?' <img src="images/floppy.png" />':''),
			'log': (cacheList[z]['log']?cacheList[z]['log']:'')
		});

		if(typeof(cacheList[z]['latitude']) == 'undefined' || typeof(cacheList[z]['longitude']) == 'undefined') {
			allCoordsKnown = false;
		}
		
		// Detect units
		if(Geocaching.settings['detectunits'] && units == null && typeof(cacheList[z]['distance'])!='undefined') {
			if(cacheList[z]['distance'].indexOf('km') != -1) {
				units = 'metric';
			} else
			if(cacheList[z]['distance'].indexOf('mi') != -1) {
				units = 'imperial';
			}
		}
	}

	if(allCoordsKnown) {
		this.generateBackgroundMap();
	}

	if (Geocaching.db != null && items.length > 0) {
		for(var p=0; p<items.length; p++) {
			this.saveToCache(items[p]);
		}
	}

	// Visibility of "Next page"
	Mojo.Log.error('Pageleft:'+searchResult['pageleft']+" nextPage:"+searchResult['nextPage']);
	if(searchResult['pageleft']==0) {
		this.controller.get('cache-list').mojo.showAddItem(searchResult.nextPage);
	}

	this.cacheListModel['items'] = items;
	this.controller.modelChanged(this.cacheListModel);

	this.controller.get('loading-spinner').hide();
	this.controller.get('list').show();
	if(typeof(this.searchParameters['lat']) != 'undefined') {
//		this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
	}
	if(units != null && units != Geocaching.settings['units']) {
		this.controller.showAlertDialog({
			onChoose: function(choice) {
				switch(choice) {
					case 'yes':
						Geocaching.settings['units'] = (Geocaching.settings['units'] == 'metric' ? 'imperial' : 'metric');
					break;
					case 'dismiss':
						Geocaching.settings['detectunits'] = false;
					break;
				}

				switch(choice) {
					case 'yes':
					case 'dismiss':
						Geocaching.storage.simpleAdd('preferences', Geocaching.settings,
							function() {},
							function() {}
						);
					break;
				}
			}.bind(this),
			'title': $L("Another units detected"),
			'message': $L("#{units} units detected. Would you like to change it in settings?").interpolate({'units': (units == 'metric'?'Metric':'Imperial')}),
			'choices':[
				{'label': $L("Yes"), 'value':'yes', 'type':'affirmative'},
				{'label': $L("No"), 'value':'no', 'type':'negative'},
				{'label': $L("No and dismiss"), 'value':'dismiss', 'type':'primary'}
			]
		});
	}

/**
 * Disabled, because of re-captcha on Groundspeak site
 */
// 	if(typeof(searchResult.dontDownloadsByCID) == 'undefined' && cids.length > 0) {
//		Geocaching.accounts['geocaching.com'].downloadLoc(cids, this.setCoordinatesFromGCCode.bind(this));
//	}

	this.loaded = true;

	// Enable recalculating timer
	if(Geocaching.settings['recalculatedistance']) {
		var recalculateTimeout = 1;
		if(typeof(searchResult.recalculateTimeout) != 'undefined') {
			recalculateTimeout = searchResult.recalculateTimeout;
		}
		this.recalculateDistanceTimeout = window.setTimeout(this.recalculateDistance.bind(this), recalculateTimeout*1000);
	}
	
	if (Geocaching.login['geid'] == null) {
		Geocaching.accounts['geocaching.com'].getUID(
			function(uid,geid) {
				Mojo.Log.info(uid);
				Geocaching.login['uid']	= uid;
				Geocaching.login['geid']= geid;
				Mojo.Log.error('New UID:'+Object.toJSON(Geocaching.login));
				Geocaching.storage.simpleAdd('login', Geocaching.login);
			}.bind(this)
		);
	}
}

ListAssistant.prototype.saveToCache = function(item) {
	Geocaching.db.transaction( 
		(function (transaction) {
			transaction.executeSql('INSERT INTO "caches"("gccode", "found") VALUES ("'+ escape(item['gccode']) + '", "'+ escape(item['found']?1:0) + '"); GO; ', [], 
				function() {},
				function(transaction,r) {
					transaction.executeSql('UPDATE "caches" SET "found"='+ escape(item['found']?1:0) +' WHERE "gccode"="'+ escape(item['gccode']) +'"; GO; ', []);
				}.bind(this)
			);
		}).bind(this)
	);
}

ListAssistant.prototype.loadFavourites = function(params, success, failure) {
	var page = params['page'];
	if (Geocaching.db != null) {
		Geocaching.db.transaction( 
			(function (transaction) {
				// When recalculating distance, there is no reason to limit query
				transaction.executeSql('select * from "caches" where "favourite"=1 order by "gccode"'+(!Geocaching.settings['recalculatedistance']?' limit 20 offset '+ (page-1)*20:''), [],
					function(transaction, results) {
						try {
							var caches = results.rows.length;
							if(caches == 0 || (Geocaching.settings['recalculatedistance'] && caches < (page-1)*20)) {
								throw("None");
							}
							var list = new Array();
							for (var i = 0; i < caches; i++) {
								try {
									var item = results.rows.item(i);
									var _cache = unescape(item['json']).evalJSON();
									list.push({
										'guid': _cache['guid'],
										'name': _cache['name'],
										'gccode': _cache['geocode'],
										'type': _cache['type'],
										'size': _cache['size'],
										'attribs': _cache['difficulty']+'/'+_cache['terrain'],
										'distance': undefined,
										'direction': undefined,
										'disabled': _cache['disabled'],
										'archived': _cache['archived'],
										'trackables': _cache['trackables'],
										'found': (item['found']==1?true:false),
										'members': _cache['members'],
										'latitude': item['latitude'],
										'longitude': item['longitude']
									});
								} catch(e) {}
							}

							var searchResult = {
								'url': '-favourites-'+page,
								'viewstate': '',
								'cacheList': list,
								'pageleft': Math.max(caches - page*20,0),
								'nextPage': (caches < page*20?false:true),
								'offset': (Geocaching.settings['recalculatedistance']?(page-1)*20:undefined),
								'limit': (Geocaching.settings['recalculatedistance']?20:undefined)
							}

							success(searchResult);
						} catch(e) {
							Mojo.Log.error(Object.toJSON(e));
							failure($L("No favourites stored."));
						}
					}.bind(this),
					function() {
						failure($L("No favourites stored."));
					}.bind(this)
				);
			}).bind(this)
		);
	} else {
		Mojo.Log.error(Object.toJSON(e));
		failure($L("No favourites stored."));
	}
}

ListAssistant.prototype.loadFieldNotes = function(params, success, failure) {
	var page = params['page'];
	var notes = FieldNotes.getNotes();
	Mojo.Log.info("Field notes: "+Object.toJSON(notes));
	gccodes = [];
	var notes_start = (page-1)*20;
	var notes_end = Math.min(notes.length, notes_start+20);
	for(var i = notes_start; i < notes_end; i++){
		if( gccodes.indexOf(notes[i]['geocode']) == -1){
			gccodes.push(notes[i]['geocode']);
		}
	}
	Mojo.Log.info("Field notes geocodes: "+Object.toJSON(gccodes));
	Mojo.Log.info("Executing SQL query: "+'select * from "caches" where "gccode" in ("'+gccodes.join('","')+'")');
	if (Geocaching.db != null) {
		Geocaching.db.transaction(
			(function (transaction) {
				transaction.executeSql('select * from "caches" where "gccode" in ("'+gccodes.join('","')+'")', [],
					function(transaction, results) {
						try {
							var caches = results.rows.length;
							if(caches == 0 ) {
								throw("None");
							}
							var list = new Array();
							for(var i = notes_start; i < notes_end; i++){
								var item = null;
								var found = false;
								for (var j = 0; j < caches; j++) {
									item = results.rows.item(j);
									if (item['gccode'] == notes[i]['geocode']) {
										found = true;
										break;
									}
								}
								var ts = new Date();
								ts.setTime(notes[i]['ts'] *1000);
								var icon = null;
								switch(notes[i]['type']){
									case "Found It":
										icon = "images/log_found.gif";
										break;
									case "Didn't find it":
										icon = "images/log_notfound.gif";
										break;
									case "Needs Maintenance":
										icon = "images/log_needsmaint.gif";
										break;
									case "Attended":
										icon = "images/log_attended.gif";
										break;
									case "Write note":
									default:
										icon = "images/log_note.gif";
										break;
								}
								var log = '<img src="'+icon+'" /> '+notes[i]['type']+": "+Mojo.Format.formatDate(ts, 'medium');
								if (found) {
									var _cache = unescape(item['json']).evalJSON();
									list.push({
										'guid': _cache['guid'],
										'name': _cache['name'],
										'gccode': _cache['geocode'],
										'type': _cache['type'],
										'attribs': _cache['difficulty']+'/'+_cache['terrain'],
										'disabled': _cache['disabled'],
										'archived': _cache['archived'],
										'log': log
									});
								} else {
									list.push({
										'gccode': notes[i]['geocode'],
										'log': log
									});
								}
							}
							var searchResult = {
								'url': '-fieldnotes-'+page,
								'viewstate': '',
								'cacheList': list,
								'pageleft': Math.max(notes.length - page*20,0),
								'nextPage': (notes.length < page*20?false:true),
								'offset': undefined,
								'limit': undefined
							}

							success(searchResult);
						} catch(e) {
							Mojo.Log.error(Object.toJSON(e));
							failure($L("No Field Notes stored."));
						}
					}.bind(this),
					function(transaction, error) {
						Mojo.Log.error("Error in sql: " + Object.toJSON(error));
						failure($L("No Field Notes stored."));
					}.bind(this)
				);
			}).bind(this)
		);
	} else {
		Mojo.Log.error(Object.toJSON(e));
		failure($L("No favourites stored."));
	}
}

ListAssistant.prototype.recalculateDistance = function(event) {
	if(!this.loaded) {
		this.recalculateDistanceTimeout = window.setTimeout(this.recalculateDistance.bind(this), 7*1000);
		return false;
	}
	try {
		this.locationSearch = this.controller.serviceRequest('palm://com.palm.location', {
			'method': 'getCurrentPosition',
			'parameters': {
				'accuracy': 1,
				'maximumAge': 10,
				'responseTime': 2
			},
			'onSuccess': this.recalculateDistanceSuccess.bind(this)
		});
	} catch(e) {
		this.recalculateDistanceTimeout = window.setTimeout(this.recalculateDistance.bind(this), 7*1000);
	}
}

ListAssistant.prototype.recalculateDistanceSuccess = function(event) {
	var accuracy = event.horizAccuracy;
	var latitude = event.latitude;
	var longitude = event.longitude;
	var heading = event.heading;

	if(event.horizAccuracy <= 0 || event.horizAccuracy > 32) {
		this.recalculateDistanceTimeout = window.setTimeout(this.recalculateDistance.bind(this), 7*1000);
		return;
	}

	var preDistance = '';
	if(event.horizAccuracy > 16) {
		preDistance = '~';
	}

	var reSort = true;
	var cacheList = this.searchResult.cacheList;
	var len = cacheList.length;
	var distance, azimuth, direction = 'N', _cache;
	for(var z = 0; z<len; z++) {
		try {
			_cache = cacheList[z];
			if(_cache['latitude'] && _cache['longitude']) {
				distance = Geocaching.getDistance(latitude, longitude, _cache['latitude'], _cache['longitude']);
				azimuth = Geocaching.getAzimuth(latitude, longitude, _cache['latitude'], _cache['longitude']);
				direction = Geocaching.getSimpleAzimuth(azimuth);

				cacheList[z]['newDistance'] = distance;
				cacheList[z]['direction'] = direction; 
			} else {
				reSort = false;
			}
		} catch(e) { }
	}
	
	var _sortCaches = function(a, b) {
		if(a['newDistance'] == undefined && b['newDistance'] == undefined) {
			return 0;
		} else
		if(a['newDistance'] == undefined) {
			return -1;
		} else
		if(b['newDistance'] == undefined) {
			return 1;
		} else {
			return a['newDistance'] - b['newDistance'];
		}
	}

	if(reSort) {
		cacheList.sort(_sortCaches);
	}

	// Get human distance
	for(var z = 0; z<len; z++) {
		try {
			_cache = cacheList[z];
			if(typeof(_cache['newDistance']) != 'undefined') {
				cacheList[z]['distance'] = '<strong>'+ preDistance+Geocaching.getHumanDistance(_cache['newDistance']) +'</strong>';
				cacheList[z]['newDistance'] = undefined;
			}
		} catch(e) { }
	}

	this.searchResult['recalculateTimeout'] = 5;
	this.searchResult['dontDownloadsByCID'] = true;

	this.buildList(this.searchResult);
}

ListAssistant.prototype.setCoordinatesFromGCCode = function(wptList)
{
	var cacheList = this.searchResult.cacheList;
	var len = cacheList.length;
	for(var z = 0; z<len; z++) {
		try {
			if(typeof(wptList[cacheList[z]['gccode']]) != 'undefined') {
				cacheList[z]['latitude'] = wptList[cacheList[z]['gccode']]['lat'];
				cacheList[z]['longitude'] = wptList[cacheList[z]['gccode']]['lon'];
			}
		} catch(e) {
			Mojo.Log.error(Object.toJSON(e));
		}
	}

	this.generateBackgroundMap();
	if(Geocaching.settings['recalculatedistance']) {
		try {
			window.clearTimeout(this.recalculateDistanceTimeout);
		} catch(e) { }
		this.recalculateDistance();
	}
}

ListAssistant.prototype.generateBackgroundMap = function()
{
	if(this.backgroundMapGenerated === false)  {
		this.backgroundMapGenerated = true;
		var showMap = false;
		var width = Mojo.Environment.DeviceInfo.screenWidth;
		var height = Mojo.Environment.DeviceInfo.screenHeight;
		var backgroundMapUrl = 'http://maps.google.com/maps/api/staticmap?size='+width+'x'+height+'&sensor=false&mobile=true&format=jpg';	
		var cacheList = this.searchResult.cacheList;
		var len = cacheList.length;
		for(var z = 0; z<len; z++) {
			try {
				if(typeof(cacheList[z]['latitude']) != 'undefined' && typeof(cacheList[z]['longitude']) != 'undefined') {
					showMap = true;
					backgroundMapUrl += '&markers='+ encodeURIComponent('color:'+ cacheTypesColors[cacheList[z].type] +'|size:tiny|'+cacheList[z]['latitude']+','+cacheList[z]['longitude']);
				}
			} catch(e) {
				Mojo.Log.error(Object.toJSON(e));
			}
		}

		try {
			if (showMap) {
				this.controller.get('backgroundmap').update(new String('<img src="#{url}" />').interpolate({'url': backgroundMapUrl}));
			}
		} catch(e) {
			Mojo.Log.error(Object.toJSON(e));
		}
	}
}
