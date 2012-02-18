function MainAssistant(args) {
	if(args) {
		var len = args.length;
		for(var i=0;i<len;i++) {
			try {
				switch(args[i]['op']) {
					case 'cacheType':
						this.modelActionCacheType['value'] = Geocaching.settings['cachetype'];
						this.controller.modelChanged(this.modelActionCacheType);
					break;
				}
			} catch(e) {
				Mojo.Log.error(Object.toJSON(e));
			}
		}
	}
}

MainAssistant.prototype.setup = function() {
	this.inputsLoaded = false;
	this.inputs = {
		'defaultView': 'view-favourites',
		'keyword': '',
		'gccode': 'GC',
		'bycoordslat': '',
		'bycoordslon': '',
		'address': '',
		'username': '',
		'owner': '',
		'tbcode': 'TB'
	};
	
	/* Actions */
	/* Search by keyword */
	this.controller.setupWidget('action-keyword',
		this.attributesActionKeyword = {
			'hintText': '',
			'textFieldName':  'name',
			'multiline':              false,
			'textReplacement': false,
			'maxLength': 50
		},
		this.modelActionKeyword = {
			'value' : '',
			'disabled': false
		}
	);
	this.controller.setupWidget('action-keywordtype',
		this.attributesKeywordType = {
			'choices': cacheIDsChoices,
			'label': $L("cache type")
		},
		this.modelActionCacheType = {
			'value': Geocaching.settings['cachetype'],
			'disabled': false
		}
	);

	this.controller.setupWidget('action-button-keyword', {},
		{
			'label': $L("Search"),
			'class': "palm-button primary",
			'disabled': false
		}
	);

	/* Search by GC Code */
	this.controller.setupWidget('action-gccode',
		this.attributesActionGCCode = {
			'hintText': 'GC',
			'textFieldName':  'name',
			'multiline':              false,
			'textReplacement': false,
			'maxLength': 10
		},
		this.modelActionGCCode = {
			'value' : 'GC',
			'disabled': false
		}
	);
	this.controller.setupWidget('action-button-gccode', {},
		{
			'label': $L("Search"),
			'class': "palm-button primary",
			'disabled': false
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

	this.controller.setupWidget('action-bycoordstype',
		this.attributesActionByCoorsType = {
			'choices': cacheIDsChoices,
			'label': $L("cache type")
		},
		this.modelActionCacheType
	);

	this.controller.setupWidget('action-button-bycoords', {},
		{
			'label': $L("Search"),
			'buttonClass': "palm-button buttonfloat primary",
			'disabled': false
		}
	);

	this.controller.setupWidget('action-button-nearest', {},
		{
			'label' : $L("Nearest"),
			'buttonClass': "buttonfloat affirmative",
			'disabled': false
		}
	);

	this.controller.setupWidget('action-button-nearest-map', {},
		{
			'label' : '',
			'buttonClass': "buttonfloat gmaps",
			'disabled': false
		}
	);	
	
	/* Search by address */
	this.controller.setupWidget('action-byaddress',
		this.attributesActionByAddress = {
			'hintText': '',
			'textFieldName':  'name',
			'multiline':              false,
			'textReplacement': false,
			'maxLength': 40
		},
		this.modelActionByAddress = {
			'value' : '',
			'disabled': false
		}
	);
	this.controller.setupWidget('action-byaddresstype',
		this.attributesByAddressType = {
			'choices': cacheIDsChoices,
			'label': $L("cache type")
		},
		this.modelActionCacheType
	);
	this.controller.setupWidget('action-button-byaddress', {},
		{
			'label': $L("Search"),
			'buttonClass': "palm-button primary",
			'disabled': false
		}
	);

	/* Found by username */
	this.controller.setupWidget('action-byusername',
		this.attributesActionByUsername = {
			'hintText': '',
			'textFieldName':  'name',
			'multiline':              false,
			'textReplacement': false,
			'maxLength': 40
		},
		this.modelActionByUsername = {
			'value' : '',
			'disabled': false
		}
	);
	this.controller.setupWidget('action-byusernametype',
		this.attributesByUsernameType = {
			'choices': cacheIDsChoices,
			'label': $L("cache type")
		},
		this.modelActionCacheType
	);
	this.controller.setupWidget('action-button-byusername', {},
		{
			'label': $L("Search"),
			'buttonClass': "palm-button primary",
			'disabled': false
		}
	);

	/* Found by Owner */
	this.controller.setupWidget('action-byowner',
		this.attributesActionByOwner = {
			'hintText': '',
			'textFieldName':  'name',
			'multiline':              false,
			'textReplacement': false,
			'maxLength': 40
		},
		this.modelActionByOwner = {
			'value' : '',
			'disabled': false
		}
	);
	this.controller.setupWidget('action-byownertype',
		this.attributesByOwnerType = {
			'choices': cacheIDsChoices,
			'label': $L("cache type")
		},
		this.modelActionCacheType
	);
	this.controller.setupWidget('action-button-byowner', {},
		{
			'label': $L("Search"),
			'buttonClass': "palm-button primary",
			'disabled': false
		}
	);

	/* Quick decode */
	this.controller.setupWidget('action-quickdecode',
		this.attributesActionQuickDecode = {
			'hintText': '',
			'textFieldName':  'name',
			'multiline':              false,
			'textReplacement': false
		},
		this.modelActionQuickDecode = {
			'value' : '',
			'disabled': false
		}
	);
	this.controller.setupWidget('action-button-quickdecode', {},
		{
			'label': $L("Decode"),
			'buttonClass': "palm-button primary",
			'disabled': false
		}
	);

	/* Favourites */
	this.controller.setupWidget('action-button-favourite', {},
		{
			'label': $L("Favourites"),
			'buttonClass': "palm-button affirmative",
			'disabled': false
		}
	);

	/* Import */
	this.controller.setupWidget('action-button-import', {},
		{
			'label': $L("Import"),
			'buttonClass': "palm-button primary",
			'disabled': false
		}
	);

	/* Trackable by code/number */
	this.controller.setupWidget('action-tbcode',
		this.attributesActionTBCode = {
			'hintText': 'TB',
			'textFieldName':  'name',
			'multiline':              false,
			'textReplacement': false,
			'maxLength': 10
		},
		this.modelActionTBCode = {
			'value' : 'TB',
			'disabled': false
		}
	);
	this.controller.setupWidget('action-button-tbcode', {},
		{
			'label': $L("Search"),
			'buttonClass': "palm-button primary",
			'disabled': false
		}
	);

	/* Trackable by keyword */
	this.controller.setupWidget('action-trackable-keyword',
		this.attributesActionTrackableKeyword = {
			'hintText': '',
			'textFieldName':  'name',
			'multiline':              false,
			'textReplacement': false,
			'maxLength': 50
		},
		this.modelActionTrackableKeyword = {
			'value' : '',
			'disabled': false
		}
	);
	
	this.controller.setupWidget('action-button-trackables-keyword', {},
		{
			'label': $L("Search"),
			'buttonClass': "palm-button primary",
			'disabled': false
		}
	);
	
	/* Trackable Favourites */
	this.controller.setupWidget('action-button-trackable-favourite', {},
		{
			'label': $L("Favourites"),
			'buttonClass': "palm-button primary",
			'disabled': false
		}
	);
	
	/* User trackables */
	this.controller.setupWidget('action-button-trackable-your', {},
		{
			'label': $L("Your Trackables"),
			'buttonClass': "palm-button primary",
			'disabled': false
		}
	);
	
	/* Compass */
	this.controller.setupWidget('action-button-compass', {},
		{
			'label': $L("Compass"),
			'buttonClass': "palm-button primary",
			'disabled': false
		}
	);
	/* Main Menu */
	this.appMenuModel = {
		'visible': true,
		'items': [
			{ 'label': $L("Import..."), 'command': 'import' },
			Mojo.Menu.editItem,
			{ 'label': $L("Accounts..."), 'command': 'accounts' },
			{ 'label': $L("Preferences..."), 'command': 'settings' },
    		{ 'label': $L("Help"), 'command': 'help' }
		]
	};
	
	/* View selector */
	this.viewList = [                                                       
		{'label': $L("Favourites"), 'command': 'view-favourites'},
		{'label': $L("Caches"), 'command': 'view-caches'},
		{'label': $L("Trackables"), 'command': 'view-trackables'},
		{'label': $L("All"), 'command': 'view-all'},
	];  
	this.currentView = 'view-favourites';

	this.viewTap = this.viewTap.bind(this);
	Mojo.Event.listen(this.controller.get('view-selector'), Mojo.Event.tap, this.viewTap);
	
	this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true}, this.appMenuModel);
	
	/* add event handlers to listen to events from widgets */
	/* Search by keyword */
	this.actionKeywordClicked = this.actionKeywordClicked.bind(this);
	Mojo.Event.listen(this.controller.get('action-button-keyword'), Mojo.Event.tap, this.actionKeywordClicked);
	/* Search by GC Code */
	this.actionGCCodeClicked = this.actionGCCodeClicked.bind(this);
	Mojo.Event.listen(this.controller.get('action-button-gccode'), Mojo.Event.tap, this.actionGCCodeClicked);
	/* Search by Coordinates */
	this.actionByCoordsClicked = this.actionByCoordsClicked.bind(this);
	Mojo.Event.listen(this.controller.get('action-button-bycoords'), Mojo.Event.tap, this.actionByCoordsClicked);
	/* Search nearest */
	this.actionNearestClicked = this.actionNearestClicked.bind(this);
	Mojo.Event.listen(this.controller.get('action-button-nearest'), Mojo.Event.tap, this.actionNearestClicked)
	
	this.actionNearestMapClicked = this.actionNearestMapClicked.bind(this);
	Mojo.Event.listen(this.controller.get('action-button-nearest-map'), Mojo.Event.tap, this.actionNearestMapClicked)

	/* Search by Address */
	this.actionByAddressClicked = this.actionByAddressClicked.bind(this);
	Mojo.Event.listen(this.controller.get('action-button-byaddress'), Mojo.Event.tap, this.actionByAddressClicked);
	/* Search by Username */
	this.actionByUsernameClicked = this.actionByUsernameClicked.bind(this);
	Mojo.Event.listen(this.controller.get('action-button-byusername'), Mojo.Event.tap, this.actionByUsernameClicked);
	/* Search by Owner */
	this.actionByOwnerClicked = this.actionByOwnerClicked.bind(this);
	Mojo.Event.listen(this.controller.get('action-button-byowner'), Mojo.Event.tap, this.actionByOwnerClicked);
	/* Quick decode */
	this.actionQuickDecodeClicked = this.actionQuickDecodeClicked.bind(this);
	Mojo.Event.listen(this.controller.get('action-button-quickdecode'), Mojo.Event.tap, this.actionQuickDecodeClicked);
	/* Favourites */
	this.actionFavouriteClicked = this.actionFavouriteClicked.bind(this);
	Mojo.Event.listen(this.controller.get('action-button-favourite'), Mojo.Event.tap, this.actionFavouriteClicked);
	/* Import */
	this.actionImportClicked = this.actionImportClicked.bind(this);
	Mojo.Event.listen(this.controller.get('action-button-import'), Mojo.Event.tap, this.actionImportClicked);
	/* Trackable by TB Code */
	this.actionTBCodeClicked = this.actionTBCodeClicked.bind(this);
	Mojo.Event.listen(this.controller.get('action-button-tbcode'), Mojo.Event.tap, this.actionTBCodeClicked);
	/* Trackable by Keyword */
	this.actionTrackableSearchClicked = this.actionTrackableSearchClicked.bind(this);
	Mojo.Event.listen(this.controller.get('action-button-trackables-keyword'), Mojo.Event.tap, this.actionTrackableSearchClicked);
	/* Trackable Favourites */
	this.actionTrackableFavouriteClicked = this.actionTrackableFavouriteClicked.bind(this);
	Mojo.Event.listen(this.controller.get('action-button-trackable-favourite'), Mojo.Event.tap, this.actionTrackableFavouriteClicked);
	/* Trackable Your Trackables */
	this.actionTrackableYourClicked = this.actionTrackableYourClicked.bind(this);
	Mojo.Event.listen(this.controller.get('action-button-trackable-your'), Mojo.Event.tap, this.actionTrackableYourClicked);
	
	/* Compass */
	this.actionCompassClicked = this.actionCompassClicked.bind(this);
	Mojo.Event.listen(this.controller.get('action-button-compass'), Mojo.Event.tap, this.actionCompassClicked);

	this.keyDown = this.keyDown.bind(this);
	this.controller.document.addEventListener('keyup', this.keyDown, true);
	
	// Load settings from storage
	Geocaching.settings['loaded'] = false;
	Geocaching.storage.simpleGet('preferences', function(response) {
		var size = Object.values(response).size();
		if(1 <= size) {
			if(typeof(response.hidemysearch)!='undefined') {
				Geocaching.settings['hidemysearch'] = response.hidemysearch;
			}
			if(typeof(response.units)!='undefined') {
				Geocaching.settings['units'] = response.units;
			}
			if(typeof(response.detectunits)!='undefined') {
				Geocaching.settings['detectunits'] = response.detectunits;
			}
			if(typeof(response.cachetype)!='undefined') {
				Geocaching.settings['cachetype'] = response.cachetype;
				this.modelActionCacheType['value'] = Geocaching.settings['cachetype'];
				this.controller.modelChanged(this.modelActionCacheType);
			}
			if(typeof(response.defaultnavigation)!='undefined') {
				Geocaching.settings['defaultnavigation'] = response.defaultnavigation;
			}
			if(typeof(response.compassInNewCard)!='undefined') {
				Geocaching.settings['compassInNewCard'] = response.compassInNewCard;
			}
			if(typeof(response.autoclean)!='undefined') {
				Geocaching.settings['autoclean'] = response.autoclean;
			}
			if(typeof(response.recalculatedistance)!='undefined') {
				Geocaching.settings['recalculatedistance'] = response.recalculatedistance;
			}
			if(typeof(response.go4cache)!='undefined') {
				Geocaching.settings['go4cache'] = response.go4cache;
			}
			if(typeof(response.debug)!='undefined') {
				Geocaching.settings['debug'] = response.debug;
			}
			if(typeof(response.theme)!='undefined') {
				Geocaching.settings['theme'] = response.theme;
				this.controller.document.body.className = Geocaching.settings['theme'];
			}
			if(typeof(response.logcount)!='undefined') {
				Geocaching.settings['logcount'] = response.logcount;
			}
			if(typeof(response.minimalaccuracy)!='undefined') {
				Geocaching.settings['minimalaccuracy'] = response.minimalaccuracy;
			}

			// Tutorials
			if(typeof(response['tutorials'].compass)!='undefined') {
				Geocaching.settings['tutorials'].compass = response['tutorials'].compass;
			}
			if(typeof(response['tutorials'].mappingtool)!='undefined') {
				Geocaching.settings['tutorials'].mappingtool = response['tutorials'].mappingtool;
			}
		}
		// Changelog
		Geocaching.settings['version'] = Mojo.Controller.appInfo.version;
		if(
			size == 0 ||
			typeof(response.version)=='undefined' ||
			(typeof(response.version)!='undefined' && response.version != Geocaching.settings['version'])
		) {
			var template = 'main/changelog-dialog';
			// Template for Beta notice
			if(Mojo.Controller.appInfo.id == 'to.yz.gcgogo.beta') {
				template = 'main/betanotice-dialog';
			}

			var ChangelogAssistant = Class.create({
				'initialize': function(sceneAssistant) {
					this.sceneAssistant = sceneAssistant;
					this.controller = sceneAssistant.controller;
				},
				'setup': function(widget) {
					this.widget = widget;
					this.controller.setupWidget('changelog-close', {},
						{
							'label': $L("Close"),
							'buttonClass': "palm-button primary",
							'disabled': false
						}
					);
					this.controller.get('changelog-close').addEventListener(Mojo.Event.tap, this.handleClose.bindAsEventListener(this));
					this.controller.setupWidget('vert_scroller', {}, {'scrollbars':false, 'mode':'vertical'});
				},
				'handleClose': function() {
					this.widget.mojo.close();
				}
			});

			var dialog = this.controller.showDialog({
				'template': template,
				'assistant': new ChangelogAssistant(this)
			});

		} else {
			this.showTip();
		}

		Geocaching.settings['loaded'] = true;
		this.controller.window.setTimeout(this.autoCleaner.bind(this), 5000);

		//  Store new version to database
		Geocaching.saveSettings();
	}.bind(this), function () {});

	// Change to default view
	this.changeView('view-favourites');
	
	// Load remembered input values
	Geocaching.storage.simpleGet('inputs', function(response) {
		var size = Object.values(response).size();
		if(1 <= size) {
			if(typeof(response.defaultView)!='undefined') {
				this.inputs['defaultView'] = response.defaultView;
				this.changeView(this.inputs['defaultView']);
			}

			if(typeof(response.keyword)!='undefined') {
				this.inputs['keyword'] = this.modelActionKeyword['value'] = response.keyword;
				this.controller.modelChanged(this.modelActionKeyword);
			}

			if(typeof(response.gccode)!='undefined') {
				this.inputs['gccode'] = this.modelActionGCCode['value'] = response.gccode;
				this.controller.modelChanged(this.modelActionGCCode);
			}

			if(typeof(response.bycoordslat)!='undefined') {
				this.inputs['bycoordslat'] = this.modelActionByCoorsLat['value'] = Geocaching.toLatLon(response.bycoordslat,'lat');
				this.controller.modelChanged(this.modelActionByCoorsLat);
			}
			
			if(typeof(response.bycoordslon)!='undefined') {
				this.inputs['bycoordslon'] = this.modelActionByCoorsLon['value'] = Geocaching.toLatLon(response.bycoordslon,'lon');
				this.controller.modelChanged(this.modelActionByCoorsLon);
			}
			
			if(typeof(response.address)!='undefined') {
				this.inputs['address'] = this.modelActionByAddress['value'] = response.address;
				this.controller.modelChanged(this.modelActionByAddress);
			}
			
			if(typeof(response.username)!='undefined') {
				this.inputs['username'] = this.modelActionByUsername['value'] = response.username;
				this.controller.modelChanged(this.modelActionByUsername);
			}
			
			if(typeof(response.owner)!='undefined') {
				this.inputs['owner'] = this.modelActionByOwner['value'] = response.owner;
				this.controller.modelChanged(this.modelActionByOwner);
			}
			
			if(typeof(response.tbcode)!='undefined') {
				this.inputs['tbcode'] = this.modelActionTBCode['value'] = response.tbcode;
				this.controller.modelChanged(this.modelActionTBCode);
			}
			
			if(typeof(response['trackables-keyword'])!='undefined') {
				this.inputs['trackables-keyword'] = this.modelActionTrackableKeyword['value'] = response['trackables-keyword'];
				this.controller.modelChanged(this.modelActionTrackableKeyword);
			}
		}
		this.inputsLoaded = true;
		
		if (typeof(gblLaunchParams['center']) != 'undefined') {
		this.inputs['bycoordslat'] = this.modelActionByCoorsLat['value'] = Geocaching.toLatLon(gblLaunchParams['center']['lat'],'lat');
		this.controller.modelChanged(this.modelActionByCoorsLat);
		this.inputs['bycoordslon'] = this.modelActionByCoorsLon['value'] = Geocaching.toLatLon(gblLaunchParams['center']['lon'],'lon');
		this.controller.modelChanged(this.modelActionByCoorsLon);
		}
		
		
		
	}.bind(this), function () {});

	if(typeof(Geocaching.login['uid']) != 'undefined' && Geocaching.login['uid'] != null) {
		this.controller.get('statsimg').update('<img src="http://img.geocaching.com/stats/img.aspx?txt=Your+statistics&uid='+ Geocaching.login['uid'] +'" />');
	}
	
	
/*
	var ts = Math.round(new Date().getTime() / 1000);
	if(ts > 1263510000) { // January, 15th, 2010
		var ExpireDialogAssistant = Class.create({
			initialize: function(sceneAssistant) {
				this.sceneAssistant = sceneAssistant;
				this.controller = sceneAssistant.controller;
			},

			setup : function(widget) {
				this.widget = widget;
				this.controller.setupWidget('expire-dialog-close', {},
					{
						label: $L("Close"),
						class: "palm-button primary",
						disabled: false
					}
				);
				this.controller.get('expire-dialog-close').addEventListener(Mojo.Event.tap, this.handleClose.bindAsEventListener(this));
			},

			handleClose: function() {
				this.widget.mojo.close();
			}
		});

		var dialog = this.controller.showDialog({
			template: 'main/expire-dialog',
			assistant: new ExpireDialogAssistant(this)
		});
	}
*/
}

MainAssistant.prototype.activate = function(event) {
}

MainAssistant.prototype.deactivate = function(event) {
}

MainAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('action-button-keyword'), Mojo.Event.tap, this.actionKeywordClicked);
	Mojo.Event.stopListening(this.controller.get('action-button-gccode'), Mojo.Event.tap, this.actionGCCodeClicked);
	Mojo.Event.stopListening(this.controller.get('action-button-bycoords'), Mojo.Event.tap, this.actionByCoordsClicked);
	Mojo.Event.stopListening(this.controller.get('action-button-nearest'), Mojo.Event.tap, this.actionNearestClicked)
	Mojo.Event.stopListening(this.controller.get('action-button-nearest-map'), Mojo.Event.tap, this.actionNearestMapClicked)
	Mojo.Event.stopListening(this.controller.get('action-button-byaddress'), Mojo.Event.tap, this.actionByAddressClicked);
	Mojo.Event.stopListening(this.controller.get('action-button-byusername'), Mojo.Event.tap, this.actionByUsernameClicked);
	Mojo.Event.stopListening(this.controller.get('action-button-byowner'), Mojo.Event.tap, this.actionByOwnerClicked);
	Mojo.Event.stopListening(this.controller.get('action-button-quickdecode'), Mojo.Event.tap, this.actionQuickDecodeClicked);
	Mojo.Event.stopListening(this.controller.get('action-button-favourite'), Mojo.Event.tap, this.actionFavouriteClicked);
	Mojo.Event.stopListening(this.controller.get('action-button-import'), Mojo.Event.tap, this.actionImportClicked);
	Mojo.Event.stopListening(this.controller.get('action-button-tbcode'), Mojo.Event.tap, this.actionTBCodeClicked);
	Mojo.Event.stopListening(this.controller.get('action-button-trackables-keyword'), Mojo.Event.tap, this.actionTrackableSearchClicked);
	Mojo.Event.stopListening(this.controller.get('action-button-trackable-favourites'), Mojo.Event.tap, this.actionTrackableFavouritesClicked);
	Mojo.Event.stopListening(this.controller.get('action-button-trackable-your'), Mojo.Event.tap, this.actionTrackableYourClicked);
	Mojo.Event.stopListening(this.controller.get('action-button-compass'), Mojo.Event.tap, this.actionCompassClicked);
}

MainAssistant.prototype.handleCommand = function(event) {
    if(event.type == Mojo.Event.command) {
		switch (event.command) {
			case 'help':
				this.controller.stageController.pushAppSupportInfoScene();
			break;
			case 'import':
				this.actionImportClicked(event);
			break;
			case 'settings':
				this.controller.stageController.pushScene('settings', this);
			break;
			case 'accounts':
				this.controller.stageController.pushScene('accounts');
			break;

		}
	}
};

MainAssistant.prototype.keyDown = function(event) {
	// Handle enter key
	if(Mojo.Char.isEnterKey(event.keyCode)) {
		if(event.srcElement.parentElement.id == 'action-bycoordslon') {
			this.actionByCoordsClicked(event);
		} else
		if(event.srcElement.parentElement.id == 'action-keyword') {
			this.actionKeywordClicked(event);
		} else
		if(event.srcElement.parentElement.id == 'action-gccode') {
			this.actionGCCodeClicked(event);
		} else
		if(event.srcElement.parentElement.id == 'action-byaddress') {
			this.actionByAddressClicked(event);
		} else
		if(event.srcElement.parentElement.id == 'action-byusername') {
			this.actionByUsernameClicked(event);
		} else
		if(event.srcElement.parentElement.id == 'action-byowner') {
			this.actionByOwnerClicked(event);
		} else
		if(event.srcElement.parentElement.id == 'action-tbcode') {
			this.actionTBCodeClicked(event);
		} else
		if(event.srcElement.parentElement.id == 'action-quickdecode') {
			this.actionQuickDecodeClicked(event);
		}
	}
};

MainAssistant.prototype.showTip = function() {
	var showTipRand = Math.floor(Math.random()*3+1);
	
	if(showTipRand == 3) {
		// User tips
		var userTips = new Array();
		if(!Geocaching.settings['go4cache']) {
			userTips.push({
				'text': $L("Share location with others..."),
				'params': {'scene': 'settings'}
			});
		}
		
		if(Geocaching.logins['twitter']['oauth_token'] == null) {
			userTips.push({
				'text': $L("Tweet your founds."),
				'params': {'scene': 'accounts'}
			});
		}

		if(Geocaching.settings['minimalaccuracy'] == 34) {
			userTips.push({
				'text': $L("You can set minimal GPS accuracy for compass."),
				'params': {'scene': 'accounts'}
			});
		}

		var userTipsLen = userTips.length;
		if(userTipsLen) {
			var userTip = userTips[Math.floor(Math.random() * userTipsLen)];
			Mojo.Controller.getAppController().showBanner({'messageText': $L("Tip: ")+ userTip['text']}, userTip['params'], 'tip');
		}
	}
}

MainAssistant.prototype.viewTap = function(event)   
{
	this.controller.popupSubmenu({
		'onChoose': this.changeView.bindAsEventListener(this),
		'toggleCmd': this.currentView,
		'placeNear': event.target,
		'items': this.viewList
	});
}; 

MainAssistant.prototype.changeView = function(view) {
	var viewName;
	switch(view) {
		case 'view-caches':
			viewName = $L("Caches");
		break;
		case 'view-trackables':
			viewName = $L("Trackables");
		break;
		case 'view-all':
			viewName = $L("All");
		break;
		case 'view-favourites':
		default:
			viewName = $L("Favourites");
			view = 'view-favourites';
	}
	
	this.controller.get('view-name').update(viewName);
	this.currentView = view;
	
	// Change view
	var rows = this.controller.get('actions').getElementsByTagName('div');
	var rowsLen = rows.length;
	var node = null;
	while (rowsLen--) {
		node = rows[rowsLen];
		if(node && node.className.match(/view\-all/)) {
			if(node.className.match(view)) {
				node.show();
			} else {
				node.hide();
			}
		}
	}
	
	// Store
	this.inputs['defaultView'] = view;
	this.saveInputs();
};

MainAssistant.prototype.saveInputs = function(event) {
	if(this.inputsLoaded) {
		try {
			Geocaching.storage.simpleAdd('inputs', this.inputs,
				function() {}.bind(this),
				function() {}.bind(this)
			);
		} catch(e) { }
	}
}

MainAssistant.prototype.actionKeywordClicked = function(event) {
	var keyword =  this.controller.get('action-keyword').mojo.getValue();
	
	this.inputs['keyword'] = keyword;
	this.saveInputs();
	
	this.controller.stageController.pushScene('list', 'keyword', {
		'keyword': keyword,
		'tx': this.modelActionCacheType['value']
	});
}


MainAssistant.prototype.actionGCCodeClicked = function(event) {
	var gccode = (''+ this.controller.get('action-gccode').mojo.getValue()).toUpperCase();
	if(gccode.indexOf('GC') != 0) {
		this.controller.showAlertDialog({
			'onChoose': function() {},
			'title': $L("Search by GC Code"),
			'message': $L("Geocache code must begin with GC."),
			'choices': [{
				'label': $L("Close"),
				'value': 'close',
				'type': 'primary'
			}]
		});
		return false;
	}
	if(gccode == 'GC') {
		this.controller.showAlertDialog({
			'onChoose': function() {},
			'title': $L("Search by GC Code"),
			'message': $L("Geocache code must be more than GC."),
			'choices': [{
				'label': $L("Close"),
				'value': 'close',
				type: 'primary'
			}]
		});
		return false;
	}
	
	this.inputs['gccode'] = gccode;
	this.saveInputs();
	
	this.controller.stageController.pushScene('cache', gccode);
}

MainAssistant.prototype.actionByCoordsClicked = function(event) {
	var lat = this.controller.get('action-bycoordslat').mojo.getValue();
	var lon = this.controller.get('action-bycoordslon').mojo.getValue();
	
	var latitude = Geocaching.parseCoordinate(lat);
	var longitude = Geocaching.parseCoordinate(lon);

	if(latitude == false) {
		this.controller.showAlertDialog({
			'title': $L("Coordinates"),
			'message': $L("Unknown format of coordinates in Latitude."),
			'choices': [{
				'label': $L("Close"),
				'type': 'primary'
			}]
		});
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

	this.inputs['bycoordslat'] = latitude;
	this.inputs['bycoordslon'] = longitude;
	this.saveInputs();

	// Share GPS location
	if(Geocaching.settings['go4cache']) {
		Geocaching.accounts['go4cache'].sendLocation(lat, lon, 'discovering');
	}
	
	this.controller.stageController.pushScene('list', 'coords', {
		'lat': latitude,
		'lon': longitude,
		'tx': this.modelActionCacheType['value']
	});
}

MainAssistant.prototype.actionNearestClicked = function(event) {
	Mojo.Controller.getAppController().showBanner({'messageText': $L("Searching your location ...")}, '', 'nearest');

	this.controller.serviceRequest('palm://com.palm.location', {
		'method': 'getCurrentPosition',
		'parameters': {
			'accuracy': 1,
			'responseTime': 1,
			'maximumAge': 60,
		},
		'onSuccess': this.actionNearestSuccess.bind(this),
		'onFailure': this.actionNearestFailed.bind(this)
	});
}

MainAssistant.prototype.actionNearestMapClicked = function(event) {
	Mojo.Controller.getAppController().showBanner({'messageText': $L("Searching your location ...")}, '', 'nearest');

	this.controller.serviceRequest('palm://com.palm.location', {
		'method': 'getCurrentPosition',
		'parameters': {
			'accuracy': 1,
			'responseTime': 1,
			'maximumAge': 60,
		},
		'onSuccess': this.actionNearestMapSuccess.bind(this),
		'onFailure': this.actionNearestFailed.bind(this)
	});
}

MainAssistant.prototype.actionNearestSuccess = function(event) {
	var accuracy = event.horizAccuracy;
	if(!accuracy) {
		this.actionNearestFailed(event);
		return false;
	}
	
	var latitude = event.latitude;
	var longitude = event.longitude;
	Mojo.Controller.getAppController().removeBanner('nearest');
	Mojo.Controller.getAppController().showBanner(
		{
			'messageText': $L("Location found, accuracy is #{acc} meters.").interpolate({'acc': accuracy.toFixed(1)})
		}, '', 'nearest');
	this.controller.get('action-bycoordslat').mojo.setValue(Geocaching.toLatLon(latitude,'lat'));
	this.controller.get('action-bycoordslon').mojo.setValue(Geocaching.toLatLon(longitude,'lon'));
	
	this.actionByCoordsClicked(event);
}

MainAssistant.prototype.actionNearestMapSuccess = function(event) {
	var accuracy = event.horizAccuracy;
	if(!accuracy) {
		this.actionNearestFailed(event);
		return false;
	}
	
	var latitude = event.latitude;
	var longitude = event.longitude;
	Mojo.Controller.getAppController().removeBanner('nearest');
	Mojo.Controller.getAppController().showBanner(
		{
			'messageText': $L("Location found, accuracy is #{acc} meters.").interpolate({'acc': accuracy.toFixed(1)})
		}, '', 'nearest');
	this.controller.get('action-bycoordslat').mojo.setValue(Geocaching.toLatLon(latitude,'lat'));
	this.controller.get('action-bycoordslon').mojo.setValue(Geocaching.toLatLon(longitude,'lon'));

	// Share GPS location
	if(Geocaching.settings['go4cache']) {
		Geocaching.accounts['go4cache'].sendLocation(latitude, longitude, 'pending');
	}

	this.inputs['bycoordslat'] = latitude;
	this.inputs['bycoordslon'] = longitude;
	this.saveInputs();

	this.controller.stageController.pushScene(
		{
			'name': 'map',
			'disableSceneScroller': true
		}, {
			'latitude': event.latitude,
			'longitude': event.longitude
		}
	);
}

MainAssistant.prototype.actionNearestFailed = function(event) {
	Mojo.Controller.getAppController().removeBanner('nearest');
	Mojo.Controller.getAppController().showBanner({'messageText': $L('Location not found!')}, '', 'nearest');
}

MainAssistant.prototype.actionByUsernameClicked = function(event) {
	var username = this.controller.get('action-byusername').mojo.getValue();
	
	this.inputs['username'] = username;
	this.saveInputs();
	
	this.controller.stageController.pushScene('list', 'username', {
		'username': username,
		'tx': this.modelActionCacheType['value']
	});
}

MainAssistant.prototype.actionByOwnerClicked = function(event) {
	var owner = this.controller.get('action-byowner').mojo.getValue();
	
	this.inputs['owner'] = owner;
	this.saveInputs();

	
	this.controller.stageController.pushScene('list', 'owner', {
		'username': owner,
		'tx': this.modelActionCacheType['value']
	});
}

MainAssistant.prototype.actionQuickDecodeClicked = function(event) {
	this.controller.showAlertDialog({
		'onChoose': function(value) {},
		'title': $L("Quick decode"),
		'message': Geocaching.decodeText(this.controller.get('action-quickdecode').mojo.getValue()),
		'choices': [{
			'label': $L("Close"),
			'value': 'close',
			'type': 'primary'
		}]
	});
}

MainAssistant.prototype.actionFavouriteClicked = function(event) {
	this.controller.stageController.pushScene('list', 'favourite', {'page': 1});
}

MainAssistant.prototype.actionImportClicked = function(event) {
	this.controller.stageController.pushScene('import');
}

MainAssistant.prototype.actionTBCodeClicked = function(event) {
	var tbcode = (''+ this.controller.get('action-tbcode').mojo.getValue()).toUpperCase();
	
	this.inputs['tbcode'] = tbcode;
	this.saveInputs();
	
	this.controller.stageController.pushScene('trackable', {'tbcode': tbcode});
};

MainAssistant.prototype.actionCompassClicked = function(event) {
	if(Geocaching.settings['compassInNewCard']) {
		var geocode = this.geocode;
		var appController = Mojo.Controller.getAppController();
		var f = function(stageController){
			stageController.pushScene(
				{
					'name': 'compass',
					'disableSceneScroller': true
				}, {
					'title': $L("Compass"),
					'waypoints': []
				}
			);
		};
		appController.createStageWithCallback({
			'name': 'compass',
			'lightweight': true
		}, f, 'card');
	} else {
		this.controller.stageController.pushScene(
			{
				'name': 'compass',
				'disableSceneScroller': true
			}, {
				'title': $L("Compass"),
				'waypoints': []
			}
		);
	}
}

MainAssistant.prototype.autoCleaner = function() {
	/* Remove old caches */
	if(Geocaching.settings['loaded'] && Geocaching.settings['autoclean'] && Geocaching.db != null) {
		Geocaching.db.transaction( 
			(function (transaction) {
				var tsNow = Math.round(new Date().getTime() / 1000)-(5*24*60*60);
				transaction.executeSql('delete from "caches" where "favourite"=0 and "updated" < ?', [tsNow]);
				transaction.executeSql('delete from "trackables" where "favourite"=0 and "updated" < ?', [tsNow]);
			}).bind(this) 
		);
	}
	this.controller.window.setTimeout(this.autoCleaner.bind(this), 60000*10); // Ten minutes interval
}

MainAssistant.prototype.actionByAddressClicked = function(event) {
	var address = this.controller.get('action-byaddress').mojo.getValue();
	
	Mojo.Controller.getAppController().showBanner({messageText: $L("Searching address...")}, '', 'search');

	Geocaching.searchAddress(address,
		function(addresses) {
			var len = addresses.length;
			if(len > 0) {
				this.inputs['address'] = address;
				this.saveInputs();
			}
			
			if(len == 1) {
				Mojo.Controller.getAppController().removeBanner('search');
				Mojo.Controller.getAppController().showBanner({'messageText': $L("Found: ")+addresses[0]['address'] }, '', 'search');
				
				// Share GPS location
				if(Geocaching.settings['go4cache']) {
					Geocaching.accounts['go4cache'].sendLocation(addresses[0]['latitude'], addresses[0]['longitude'], 'discovering');
				}
				
				this.controller.stageController.pushScene('list', 'coords', {
					'lat': addresses[0]['latitude'],
					'lon': addresses[0]['longitude'],
					'tx': this.modelActionCacheType['value']
				});
			} else
			if(len > 0) {
				this.controller.showDialog({
					'template': 'main/addresses-scene',
					'assistant': new MainAddressesAssistant(
						addresses,
						this,
						function(latitude, longitude) {
							// Share GPS location
							if(Geocaching.settings['go4cache']) {
								Geocaching.accounts['go4cache'].sendLocation(latitude, longitude, 'discovering');
							}
							
							this.controller.stageController.pushScene('list', 'coords', {
								'lat': latitude,
								'lon': longitude,
								'tx': this.modelActionCacheType['value']
							});
						}.bind(this)
					)
				});
			}
		}.bind(this),
		function(message) {
			this.controller.showAlertDialog({
				'title': $L("Search by address"),
				'message': message,
				'choices': [{
					'label': $L("Close"),
					'type': 'primary'
				}]
			});
		}.bind(this)
	);
}

MainAssistant.prototype.actionTrackableFavouriteClicked = function(event) {
	this.controller.stageController.pushScene('trackables', 'favourite', {'page': 1});
};

MainAssistant.prototype.actionTrackableYourClicked = function(event) {
	this.controller.stageController.pushScene('trackables', 'your', {'page': 1});
};

MainAssistant.prototype.actionTrackableSearchClicked = function(event) {
	var keyword =  this.controller.get('action-trackable-keyword').mojo.getValue();
	
	this.inputs['trackables-keyword'] = keyword;
	this.saveInputs();
	
	this.controller.stageController.pushScene('trackables', 'search', {'keyword': keyword});
};

