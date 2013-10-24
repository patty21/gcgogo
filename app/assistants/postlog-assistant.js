function PostlogAssistant(gccode) {
	this.geocode = gccode;
}

PostlogAssistant.prototype.setup = function() {
	this.controller.get('icon').innerHTML = '<img class="gc-icon" src="images/'+ cacheTypes[cache[this.geocode].type] +'.gif" /> ';
	this.controller.get('icon').className = 'icon img';
	this.controller.get('title').update($L("Post log to #{geocode}").interpolate({'geocode': this.geocode}));

	this.viewstate = [];
	this.viewstate1 = [];
	this.trackables = [];
	this.logTypes = [];


	switch(cache[this.geocode].type) {
		case 'Earthcache':
		case 'Webcam Cache':
		case 'Virtual Cache':
			this.trackablesChoices = false;
		break;
		default:
			this.trackablesChoices = true;	
	}

	this.controller.setupWidget('logtype',
		this.attributesLogType = {
			'label': $L("Log type")
		},
		this.modelLogType = {
			'value': '',
			'choices': [{'label': $L("Loading ..."), 'value': ''}],
			'disabled': true
		}
	);
	
	this.controller.setupWidget('body',
		this.attributesBody = {
			'hintText': '',
			'textFieldName':  'body',
			'multiline':              true,
			'focus':                  true,
			'modifierState':  Mojo.Widget.capsLock,
			'limitResize':    false,
			'holdToEnable':  false,
			'focusMode': Mojo.Widget.focusSelectMode,
			'changeOnKeyPress': true,
			'textReplacement': false,
//			'maxLength': 160,
			'requiresEnterKey': false
		},
		this.modelBody = {
			'value': '',
			'disabled': false
		}
	);

	
	this.controller.setupWidget('send-button',
		{
			'type': Mojo.Widget.activityButton
		},
		this.modelSendButton = {
			'buttonLabel': $L("Submit"),
			'buttonClass': 'affirmative',
			'disabled': true
		}
	);

	// Trackables
	this.controller.setupWidget("trackables-list",
		this.attributes = {
			'itemTemplate': 'postlog/trackables-item',
			'listTemplate': 'postlog/trackables-container',
			'emptyTemplate':'postlog/trackables-empty',
			'onItemRendered': function(listWidget, itemModel, itemNode) {
				Mojo.Event.listen(this.controller.get('trackable_'+itemModel['num']),Mojo.Event.propertyChange,this.radioCallback);
			}.bind(this)
		},
		this.trackablesListModel = {
			'listTitle': $L("Trackables"),
			'items' : null
		}
	);
	// Change radio
	this.radioCallback = this.radioCallback.bindAsEventListener(this);
//	Mojo.Event.listen(this.controller.get('trackable'),Mojo.Event.propertyChange,this.radioCallback);

	// Submit Log
	this.submitClicked = this.submitClicked.bind(this);
	Mojo.Event.listen(this.controller.get('send-button'), Mojo.Event.tap, this.submitClicked);

	// Load Post Log Page data
	Geocaching.accounts['geocaching.com'].postLogLoad(
		{ 'cacheid': cache[this.geocode].cacheid},
		function(logParams) {
			this.viewstate = logParams['viewstate'];
			this.viewstate1 = logParams['viewstate1'];
			this.logTypes = logParams['logTypes'];
			this.trackables = logParams['trackables'];
			this.generateLogTypes();
			this.generateTrackablesList();
		}.bind(this),
		function(message) {
			this.showPopup(null, $L("Problem"), message, function() { Mojo.Controller.stageController.popScene(); });
			return false;
		}.bind(this)
	);

	if( gcGogo.isTouchpad() ){
		this.controller.setupWidget(Mojo.Menu.commandMenu, {'menuClass': 'no-fade'},
			this.commandMenuModel = {'items': [
				{'label': $L("Back"), 'iconPath': 'images/menu-icon-back.png', 'command': 'goback'}
			]});
	}
};

PostlogAssistant.prototype.handleCommand = function(event) {
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

PostlogAssistant.prototype.activate = function(event) {
};

PostlogAssistant.prototype.deactivate = function(event) {
};

PostlogAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('send-button'), Mojo.Event.tap, this.submitClicked);
};

PostlogAssistant.prototype.showPopup = function(event, title, message, onChoose) {
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

PostlogAssistant.prototype.generateLogTypes = function() {
	var _logTypes = new Array();
	
	var z, x, logTypeID, showLogType;
	var logTypesCount = logTypes.length;
	var cacheLogTypes = this.logTypes;
	var cacheLogTypesCount = this.logTypes.length;
	
	for(z=0; z<logTypesCount; z++) {
		logTypeID = logTypes[z]['value'];
		showLogType = false;
		for(x=0; x<cacheLogTypesCount; x++) {
			if(cacheLogTypes[x] == logTypeID) {
				showLogType = true;
				break;
			}
		}
		
		if(showLogType) {
			_logTypes.push(logTypes[z]);
		}
	}
	
	this.modelLogType['choices'] = _logTypes;
	this.modelLogType['value'] = _logTypes[0]['value'];
	this.modelLogType['disabled'] = false;
	this.controller.modelChanged(this.modelLogType);
	
	// Enable Submit button
	this.modelSendButton['disabled'] = false;
	this.controller.modelChanged(this.modelSendButton);
};

PostlogAssistant.prototype.generateTrackablesList = function() {
	var trackablesCount = this.trackables.length;
	if(trackablesCount > 0 && this.trackablesChoices) {
		this.trackablesListModel['items'] = this.trackables;
		this.controller.modelChanged(this.trackablesListModel);
		this.controller.get('trackables').show();
	}
};

PostlogAssistant.prototype.submitClicked = function(event) {
	var body = this.controller.get('body').mojo.getValue();
	if(body == '') {
		this.controller.get('send-button').mojo.deactivate();
		this.showPopup(null, $L("Problem"), $L("Fill some log text."));
		return false;
	}

	Geocaching.accounts['geocaching.com'].postLogSubmit(
		{
			'cacheid': cache[this.geocode].cacheid,
			'viewstate': this.viewstate,
			'viewstate1': this.viewstate1,
			'logType': this.modelLogType['value'],
			'body': body,
			'trackables': this.trackables
		},
		function() {
			Mojo.Controller.getAppController().showBanner({'messageText': $L("Log posted.")}, '', 'postlog');
			this.controller.stageController.popScene('posted');
		}.bind(this),
		function(message) {
			this.showPopup(null, $L("Problem"), message, function() { 
				//Mojo.Controller.stageController.popScene();
				this.controller.get('send-button').mojo.deactivate(); 
			});
			return false;
		}.bind(this)
	);
};

PostlogAssistant.prototype.radioCallback = function(event) {
	var trackablesCount = this.trackables.length;
	for(var z=0; z<trackablesCount; z++) {
		if(this.trackables[z]['num'] == event.model['num']) {
			if (event.value==true) {
				this.trackables[z]['choice'] = "_DroppedOff";
			} else {
				this.trackables[z]['choice'] = "";
			}
			break;
		}
	}
};
