function TrackablesAssistant(searchMethod, parameters) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.searchMethod = searchMethod;
	this.searchParameters = parameters;
	this.searchResult = null;
}

TrackablesAssistant.prototype.setup = function() {
	
	this.controller.setupWidget('loading-spinner', 
		this.spinnerLAttrs = {
			'spinnerSize': 'large'
		},
		this.spinnerModel = {
			'spinning': true
		}
	);

	var swipe =  this.searchMethod == 'favourite';
	if(swipe == false) {
		try {
			swipe = this.searchParameters['url'].match(/^\-/);
		} catch(e) { }
	}

	this.controller.setupWidget('trackables-list',
		this.attributes = {
			'itemTemplate': 'trackables/list-item',
			'listTemplate': 'trackables/list-container',
			'emptyTemplate':'trackables/list-empty',
			'addItemLabel': $L("Next page"),
			'swipeToDelete': swipe
		},
		this.trackablesListModel = {
			'listTitle': $L("Trackables"),
			'items': []
		}
	);
	
	this.handleTackablesListTap = this.handleTackablesListTap.bindAsEventListener(this);
	Mojo.Event.listen(this.controller.get('trackables-list'), Mojo.Event.listTap, this.handleTackablesListTap);
	
	this.handleNextPage = this.handleNextPage.bind(this);
	Mojo.Event.listen(this.controller.get('trackables-list'),Mojo.Event.listAdd, this.handleNextPage);

	
	this.sceneTitle = '';
	
	switch(this.searchMethod) {
		case 'cache': // Trackables in cache
			this.sceneTitle = $L("#{geocode}'s trackables").interpolate({'geocode': this.searchParameters['gccode']});
			var searchResult = {
				'url': '-cache-'+ this.searchParameters['gccode'],
				'viewstate': '',
				'trackablesList': cache[this.searchParameters['gccode']].trackables,
				'trackableId': 'guid',
				'nextPage': false,
				'offset': 0,
				'limit': cache[this.searchParameters['gccode']].trackables.length
			}
			window.setTimeout(function() { this.buildList(searchResult); }.bind(this), 150);
			
			//  Set icon
			this.controller.get('icon').update('<img class="gc-icon" src="images/'+ cacheTypes[cache[this.searchParameters['gccode']].type] +'.gif" />');
			this.controller.get('icon').className = 'icon img';
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
		case 'your':
			this.sceneTitle = $L("Your Trackables");
			Mojo.Log.info('Here');
			Geocaching.accounts['geocaching.com'].yourTrackables({},
				this.buildList.bind(this),
				function(message) {
					this.controller.get('loading-spinner').hide();
					this.showPopup(null, $L("Problem"), message, function() { Mojo.Controller.stageController.popScene(); });
					return false;
				}.bind(this)
			);
		break;
		case 'search':
			this.sceneTitle = $L("Search by Keyword");
			Geocaching.accounts['geocaching.com'].searchTrackables({
					'keyword': this.searchParameters['keyword']
				},
				this.buildList.bind(this),
				function(message) {
					this.controller.get('loading-spinner').hide();
					this.showPopup(null, $L("Problem"), message, function() { Mojo.Controller.stageController.popScene(); });
					return false;
				}.bind(this)
			);
		break;
		case 'nextpage':
			this.sceneTitle = this.searchParameters['title'];
			// Search by URL
			Geocaching.accounts['geocaching.com'].searchTrackablesByUrlNextPage({
					'url': this.searchParameters['url'],
					'viewstate': this.searchParameters['viewstate']
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

	this.controller.get('title').update(this.sceneTitle);

	if( gcGogo.isTouchpad() ){
		this.controller.setupWidget(Mojo.Menu.commandMenu, {'menuClass': 'no-fade'},
			this.commandMenuModel = {'items': [
				{'label': $L("Back"), 'iconPath': 'images/menu-icon-back.png', 'command': 'goback'}
			]});
	}
};

TrackablesAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.command) {
		switch(event.command) {
			case 'goback':
				this.controller.stageController.popScene();
			break;
			default:
			break;
		}
	}
}

TrackablesAssistant.prototype.activate = function(event) {
};

TrackablesAssistant.prototype.deactivate = function(event) {
};

TrackablesAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('trackables-list'), Mojo.Event.listTap, this.handleTackablesListTap);
	Mojo.Event.stopListening(this.controller.get('trackables-list'), Mojo.Event.listAdd, this.handleNextPage);
};


TrackablesAssistant.prototype.showPopup = function(event, title, message, onChoose) {
	if(typeof(onChoose) != 'function') {
		onChoose = function() {}
	}
	this.controller.showAlertDialog({
		'onChoose': onChoose,
		'title': title,
		'message': message,
		'choices':[ {'label':$L("Close"), 'value':'close', 'type':'negative'} ]
	});
};

TrackablesAssistant.prototype.buildList = function(searchResult) {
	this.viewstate = searchResult['viewstate'];
	this.url = searchResult['url'];

	// Visibility of "Next page"
	if(typeof(searchResult.nextPage) != 'undefined') {
		this.controller.get('trackables-list').mojo.showAddItem(searchResult.nextPage);
	}
	this.trackablesListModel['items'] = searchResult['trackablesList'];
	this.controller.modelChanged(this.trackablesListModel);

	this.controller.get('loading-spinner').hide();
	this.controller.get('list').show();
	
	this.searchResult = searchResult;
};

TrackablesAssistant.prototype.handleTackablesListTap = function(event) {
	if(typeof(event.item['guid']) != 'undefined') {
		var params = {};
		params[this.searchResult['trackableId']] = event.item['guid'];
		
		this.controller.stageController.pushScene(
			{
				'name': 'trackable',
			}, params
		);
	}
};

TrackablesAssistant.prototype.handleNextPage = function(event) {
	this.controller.stageController.pushScene('trackables', 'nextpage', {
		'title': this.sceneTitle,
		'url': this.url,
		'viewstate': this.viewstate
	});
}

TrackablesAssistant.prototype.loadFavourites = function(params, success, failure) {
	var page = params['page'];
	if (Geocaching.db != null) {
		Geocaching.db.transaction( 
			(function (transaction) {
				// When recalculating distance, there is no reason to limit query
				transaction.executeSql('select * from "trackables" where "favourite"=1 order by "tbcode" limit 20 offset '+ (page-1)*20, [],
					function(transaction, results) {
						try {
							var trackables = results.rows.length;
							if(trackables == 0) {
								throw("None");
							}
							var list = new Array();
							var item, _trackable;
							for (var i = 0; i < trackables; i++) {
								try {
									item = results.rows.item(i);
									_trackable = unescape(item['json']).evalJSON();

									list.push({
										'guid': item['guid'],
										'name': _trackable['name'],
										'img': _trackable['type']
									});
								} catch(e) {}
							}

							var searchResult = {
								'url': '-favourites-'+page,
								'viewstate': '',
								'trackablesList': list,
								'trackableId': 'guid',
								'nextPage': (trackables < page*20?false:true),
								'offset': (page-1)*20,
								'limit': 20
							}

							success(searchResult);

						} catch(e) {
							Mojo.Log.error(Object.toJSON(e));
							failure($L("No favourites stored."));
						}
					}.bind(this),
					function() {
						Mojo.Log.error(Object.toJSON(e));
						failure($L("No favourites stored."));
					}.bind(this)
				);
			}).bind(this)
		);
	} else {
		Mojo.Log.error(Object.toJSON(e));
		failure($L("No favourites stored."));
	}
};
