function PostlogTrackablesAssistant(tbcode) {
	this.tbcode = tbcode;
}

PostlogTrackablesAssistant.prototype.setup = function() {
	this.controller.get('icon').innerHTML = '<img class="gc-icon" src="http://www.geocaching.com/images/wpttypes/'+ trackable[this.tbcode].type +'.gif" /> ';
	this.controller.get('icon').className = 'icon img';
	this.controller.get('title').update($L("Post log to #{geocode}").interpolate({'geocode': this.tbcode}));

	this.viewstate = [];
	this.viewstate1 = [];
	this.logTypes = [];


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
	
	this.controller.setupWidget('trackingcode',
		{
			'hintText': '',
			'textFieldName': 'name',
			'multiline': false,
			'textReplacement': false,
			'maxLength': 20,
			'focus': true,
		},
		this.modelTrackingCode = {
			'value' : trackable[this.tbcode].trackingCode,
			'disabled': false
		}
	);

	
	this.controller.setupWidget('body',
		this.attributesBody = {
			'hintText': '',
			'textFieldName':  'body',
			'multiline': true,
			'modifierState':  Mojo.Widget.capsLock,
			'limitResize': false,
			'holdToEnable': false,
			'focusMode': Mojo.Widget.focusSelectMode,
			'changeOnKeyPress': true,
			'textReplacement': false,
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

	// Submit Log
	this.submitClicked = this.submitClicked.bind(this);
	Mojo.Event.listen(this.controller.get('send-button'), Mojo.Event.tap, this.submitClicked);

	// Load Post Log Page data
	Geocaching.accounts['geocaching.com'].postLogTrackableLoad(
		{ 'guid': trackable[this.tbcode].guid},
		function(logParams) {
			this.viewstate = logParams['viewstate'];
			this.viewstate1 = logParams['viewstate1'];
			this.logTypes = logParams['logTypes'];
			this.generateLogTypes();
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

PostlogTrackablesAssistant.prototype.handleCommand = function(event) {
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

PostlogTrackablesAssistant.prototype.activate = function(event) {
};

PostlogTrackablesAssistant.prototype.deactivate = function(event) {
};

PostlogTrackablesAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('send-button'), Mojo.Event.tap, this.submitClicked);
};

PostlogTrackablesAssistant.prototype.showPopup = function(event, title, message, onChoose) {
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

PostlogTrackablesAssistant.prototype.generateLogTypes = function() {
	var _logTypes = new Array();
	
	var z, x, logTypeID, showLogType;
	var logTypesCount = logTypesTrackable.length;
	var cacheLogTypes = this.logTypes;
	var cacheLogTypesCount = this.logTypes.length;
	
	for(z=0; z<logTypesCount; z++) {
		logTypeID = logTypesTrackable[z]['value'];
		showLogType = false;
		for(x=0; x<cacheLogTypesCount; x++) {
			if(cacheLogTypes[x] == logTypeID) {
				showLogType = true;
				break;
			}
		}
		
		if(showLogType) {
			_logTypes.push(logTypesTrackable[z]);
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
PostlogTrackablesAssistant.prototype.submitClicked = function(event) {
	var body = this.controller.get('body').mojo.getValue();
	if(body == '') {
		this.controller.get('send-button').mojo.deactivate();
		this.showPopup(null, $L("Problem"), $L("Fill some log text."));
		return false;
	}

	var trackingCode = this.controller.get('trackingcode').mojo.getValue();
	var logType = this.modelLogType['value'];
	if(trackingCode == '' && logType != 4) {
		this.controller.get('send-button').mojo.deactivate();
		this.showPopup(null, $L("Problem"), $L("You must enter Tracking code."));
		return false;
	} else
	if(logType == 4) {
		trackingCode = '';
	}

	Geocaching.accounts['geocaching.com'].postLogTrackablesSubmit(
		{
			'guid': trackable[this.tbcode].guid,
			'viewstate': this.viewstate,
			'viewstate1': this.viewstate1,
			'logType': logType,
			'trackingCode': trackingCode,
			'body': body
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
