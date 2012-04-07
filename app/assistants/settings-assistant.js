function SettingsAssistant(pusher) {
	this.pusher = pusher;
}

SettingsAssistant.prototype.setup = function() {
	/* Hide my search */
	this.controller.setupWidget("toggle-hidemysearch",
		{
			'trueValue': true,
			'trueLabel': $L("Yes"),
			'falseValue': false,
			'falseLabel': $L("No")
		},
		this.modelHidemysearch = {
			'value': Geocaching.settings['hidemysearch'],
			'disabled': false
		}
	);

	/* Theme */
	this.controller.setupWidget("toggle-theme",
		{
			'trueValue': 'palm-default',
			'trueLabel': $L("Default"),
			'falseValue': 'palm-dark',
			'falseLabel': $L("Dark")
		},
		this.modelTheme = {
			'value': Geocaching.settings['theme'],
			'disabled': false
		}
	);

	/* Units */
	this.controller.setupWidget("toggle-units",
		{
			'trueValue': 'imperial',
			'trueLabel': $L("Imperial"),
			'falseValue': 'metric',
			'falseLabel': $L("Metric")
		},
		this.modelUnits = {
			'value': Geocaching.settings['units'],
			'disabled': false
		}
	);
	this.controller.setupWidget("toggle-detectunits",
		{
			'trueValue': true,
			'falseValue': false 
		},
		this.modelDetectUnits = {
			'value': Geocaching.settings['detectunits'],
			'disabled': false
		}
	);

	/* Default download Log count */
	this.controller.setupWidget('logcount', 
		{
			'label': $L({'value':"Download log count",'key':'download_log_count'}),
			'min': 0,
			'max': 50
		},
		this.modelLogCount = {
			'value': Geocaching.settings['logcount'],
			'disabled': false
		}
	);

	/* Minimum GPS accuracy */
	this.controller.setupWidget('minimalaccuracy', 
		{
			'label': $L("Minimal GPS accuracy"),
			'min': 15,
			'max': 150
		},
		this.modelMinimalAccuracy = {
			'value': Geocaching.settings['minimalaccuracy'],
			'disabled': false
		}
	);

	
	/* Cache type */
	this.controller.setupWidget('cachetype',
		this.attributesCacheType = {
			'choices': cacheIDsChoices,
			'label': $L({'value': "default search", 'key': 'default_search'}),
			'labelPlacement': Mojo.Widget.labelPlacementLeft
		},
		this.modelActionCacheType = {
			'value': Geocaching.settings['cachetype'],
			'disabled': false
		}
	);

	/* Use builtin compass */
	/*this.controller.setupWidget("builtin-compass",
		{
			'trueValue': 'builtin',
			'trueLabel': $L("Yes"),
			'falseValue': 'googlemaps',
			'falseLabel': $L("No")
		},
		this.modelDefaultNavigation = {
			'value': Geocaching.settings['defaultnavigation'],
			'disabled': false
		}
	);*/
	this.controller.setupWidget('builtin-compass',
		{
			'choices': [
				{'label': $L({'value': "Builtin compass", 'key': 'builtin_compass'}), 'value': 'builtin'},
				{'label': $L({'value': "Mapping Tool", 'key': 'mapping_tool'}), 'value': 'mappingtool'},
				{'label': $L({'value': "Google Maps", 'key': 'google_maps'}), 'value': 'googlemaps'}
			],
			'label': $L({'value': "default navigation", 'key': 'default_navigation'}),
			'labelPlacement': Mojo.Widget.labelPlacementLeft
		},
		this.modelDefaultNavigation = {
			'value': Geocaching.settings['defaultnavigation'],
			'disabled': false
		}
	);
	this.controller.setupWidget("toggle-compassinnewcard",
		{
			'trueValue': true,
			'trueLabel': $L("Yes"),
			'falseValue': false,
			'falseLabel': $L("No")
		},
		this.modelCompassInNewCard = {
			'value': Geocaching.settings['compassInNewCard'],
			'disabled': false
		}
	);
	this.controller.setupWidget("toggle-magneticcompass",
		{
			'trueValue': true,
			'trueLabel': $L("Yes"),
			'falseValue': false,
			'falseLabel': $L("No")
		},
		this.modelMagneticCompass = {
			'value': Geocaching.settings['magneticcompass'],
			'disabled': false
		}
	);

	/* Autoclean */
	this.controller.setupWidget("toggle-autoclean",
		{
			'trueValue': true,
			'trueLabel': $L("Yes"),
			'falseValue': false,
			'falseLabel': $L("No")
		},
		this.modelAutoclean = {
			'value': Geocaching.settings['autoclean'],
			'disabled': false
		}
	);

	/* Recalculate distance */
	this.controller.setupWidget("toggle-recalculatedistance",
		{
			'trueValue': true,
			'trueLabel': $L("Yes"),
			'falseValue': false,
			'falseLabel': $L("No")
		},
		this.modelRecalculateDistance = {
			'value': Geocaching.settings['recalculatedistance'],
			'disabled': false
		}
	);

	/* Share location */
	this.controller.setupWidget('toggle-go4cache',
		{
			'trueValue': true,
			'trueLabel': $L("Yes"),
			'falseValue': false,
			'falseLabel': $L("No")
		},
		this.modelGo4Cache = {
			'value': Geocaching.settings['go4cache'],
			'disabled': false
		}
	);

	/* Debugging */
	this.controller.setupWidget('toggle-debug',
		{
			'trueValue': true,
			'trueLabel': $L("Yes"),
			'falseValue': false,
			'falseLabel': $L("No")
		},
		this.modelDebug = {
			'value': Geocaching.settings['debug'],
			'disabled': false
		}
	);
	
	/* Reset */
	this.controller.setupWidget('reset-tutorials', {},
		{
			'label': $L({'value': "Reset Tips & Tutorials", 'key': 'reset_tutorial'}),
			'class': "palm-button primary",
			'disabled': false
		}
	);

	/* Clear memory cache */
	this.controller.setupWidget('clear-geocaches', {},
		{
			'label': $L({'value': "Clear Geocaches", 'key': 'clear_geocaches'}),
			'buttonClass': 'negative',
			'disabled': false
		}
	);

	this.actionResetClicked = this.actionResetClicked.bind(this);
	Mojo.Event.listen(this.controller.get('reset-tutorials'), Mojo.Event.tap, this.actionResetClicked);

	this.actionClearGeocachesClicked = this.actionClearGeocachesClicked.bind(this);
	Mojo.Event.listen(this.controller.get('clear-geocaches'), Mojo.Event.tap, this.actionClearGeocachesClicked);

	this.actionSave = this.actionSave.bind(this);
	Mojo.Event.listen(this.controller.get('toggle-hidemysearch'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.listen(this.controller.get('toggle-theme'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.listen(this.controller.get('toggle-units'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.listen(this.controller.get('toggle-detectunits'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.listen(this.controller.get('logcount'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.listen(this.controller.get('minimalaccuracy'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.listen(this.controller.get('cachetype'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.listen(this.controller.get('builtin-compass'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.listen(this.controller.get('toggle-compassinnewcard'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.listen(this.controller.get('toggle-magneticcompass'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.listen(this.controller.get('toggle-autoclean'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.listen(this.controller.get('toggle-recalculatedistance'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.listen(this.controller.get('toggle-go4cache'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.listen(this.controller.get('toggle-debug'), Mojo.Event.propertyChange, this.actionSave);
}

SettingsAssistant.prototype.activate = function(event) {
}

SettingsAssistant.prototype.deactivate = function(event) {
}

SettingsAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('reset-tutorials'), Mojo.Event.tap, this.actionResetClicked);
	Mojo.Event.stopListening(this.controller.get('clear-geocaches'), Mojo.Event.tap, this.actionClearGeocachesClicked);
	Mojo.Event.stopListening(this.controller.get('toggle-hidemysearch'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.stopListening(this.controller.get('toggle-theme'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.stopListening(this.controller.get('toggle-units'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.stopListening(this.controller.get('toggle-detectunits'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.stopListening(this.controller.get('logcount'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.stopListening(this.controller.get('minimalaccuracy'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.stopListening(this.controller.get('cachetype'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.stopListening(this.controller.get('builtin-compass'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.stopListening(this.controller.get('toggle-compassinnewcard'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.stopListening(this.controller.get('toggle-magneticcompass'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.stopListening(this.controller.get('toggle-autoclean'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.stopListening(this.controller.get('toggle-recalculatedistance'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.stopListening(this.controller.get('toggle-go4cache'), Mojo.Event.propertyChange, this.actionSave);
	Mojo.Event.stopListening(this.controller.get('toggle-debug'), Mojo.Event.propertyChange, this.actionSave);
}

SettingsAssistant.prototype.actionSave = function(event) {
	Geocaching.settings['hidemysearch'] = this.modelHidemysearch.value;
	Geocaching.settings['theme'] = this.modelTheme.value;
	Geocaching.settings['units'] = this.modelUnits.value;
	Geocaching.settings['detectunits'] = this.modelDetectUnits.value;
	Geocaching.settings['cachetype'] = this.modelActionCacheType.value;
	Geocaching.settings['defaultnavigation'] = this.modelDefaultNavigation.value;
	Geocaching.settings['compassInNewCard'] = this.modelCompassInNewCard.value;
	Geocaching.settings['magneticcompass'] = this.modelMagneticCompass.value;
	Geocaching.settings['autoclean'] = this.modelAutoclean.value;
	Geocaching.settings['recalculatedistance'] = this.modelRecalculateDistance.value;
	Geocaching.settings['logcount'] = this.modelLogCount.value;
	Geocaching.settings['minimalaccuracy'] = this.modelMinimalAccuracy.value;
	Geocaching.settings['go4cache'] = this.modelGo4Cache.value;
	Geocaching.settings['debug'] = this.modelDebug.value;
	Geocaching.saveSettings();

	this.controller.document.body.className = Geocaching.settings['theme'];
	this.pusher.modelActionCacheType['value'] = Geocaching.settings['cachetype'];
	this.pusher.controller.modelChanged(this.pusher.modelActionCacheType);
}

SettingsAssistant.prototype.actionResetClicked = function(event) {
	Geocaching.settings['tutorials'].mappingtool = false;
	Geocaching.settings['tutorials'].compass = false;
	Geocaching.saveSettings();

	this.controller.showAlertDialog({
		'onChoose': function(value) {},
		'title': $L("Settings"),
		'message': $L({'value':"All Tips & Tutorials were reset.", 'key':'settings_reset_message'}),
		'choices': [{'label': $L("Close"), 'value':'close', 'type':'primary'} ]
	});
}

SettingsAssistant.prototype.actionClearGeocachesClicked = function(event) {
	this.controller.showAlertDialog({
		'onChoose': function(choice) {
			if(choice == 'clear') {
				this.clearGeocaches();
			}
		}.bind(this),
		'title': $L("Settings"),
		'message': $L({'value':"Do you really want delete all Geocaches from memory? This will erase all your list too.", 'key':'clear_geocaches_question'}),
		'choices': [
			{'label': $L("Clear"), 'value':'clear', 'type':'negative'},
			{'label': $L("Cancel"), 'value':'cancel', 'type':'primary'}
		]
	});
}

SettingsAssistant.prototype.clearGeocaches = function() {
	Geocaching.db.transaction( 
		(function (transaction) { 
			transaction.executeSql('DELETE FROM "caches" WHERE 1=1; GO; ', [],
				function(transaction, results) {
					this.controller.showAlertDialog({
						'onChoose': function(value) {},
						'title': $L("Settings"),
						'message': $L({'value':"All Geocaches were cleared.", 'key':'clear_geocaches_question'}),
						'choices': [{'label': $L("Close"), 'value':'close', 'type':'primary'} ]
					});
				}.bind(this)
			);
		}).bind(this)
	);
} 
