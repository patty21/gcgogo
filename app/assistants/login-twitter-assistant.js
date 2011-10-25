function LoginTwitterAssistant() {
	this.oauth_token = '';
}

LoginTwitterAssistant.prototype.setup = function() {
	this.controller.setupWidget('inputPIN',
		this.attributesPin = {
			'hintText': $L("Twitter PIN"),
			'textFieldName':  'pin',
			'multiline':              false,
			'focus':                  true,
			'modifierState':  Mojo.Widget.capsLock,
			'limitResize':    false,
			'holdToEnable':  false,
			'focusMode': Mojo.Widget.focusSelectMode,
			'changeOnKeyPress': true,
			'textReplacement': false,
			'maxLength': 7,
			'requiresEnterKey': false
		},
		this.modelPin = {
			'value': '',
			'disabled': false
		}
	);

	this.controller.setupWidget("posttweet",
		{
			'trueValue': true,
			'falseValue': false 
		},
		this.postTweetModel = {
			'value': true,
			'disabled': false
		}
	);

	this.controller.setupWidget('authorize-button',
		{
			'type': Mojo.Widget.activityButton
		},
		this.modelLoginButton = {
			'buttonLabel': $L("Authorize"),
			'buttonClass': 'affirmative',
			'disabled': false
		}
	);	

	this.controller.setupWidget('register-button',
		{},
		this.modelRegisterButton = {
			'buttonLabel': $L("Sign up"),
			'buttonClass': 'primary',
			'disabled': false
		}
	);

	this.controller.setupWidget('pin-button',
		{
			'type': Mojo.Widget.activityButton
		},
		this.modelPinButton = {
			'buttonLabel': $L("Verify"),
			'buttonClass': 'affirmative',
			'disabled': false
		}
	);	

	this.controller.setupWidget('unlink-button',
		{},
		this.modelPinButton = {
			'buttonLabel': $L("Unlink"),
			'buttonClass': 'negative',
			'disabled': false
		}
	);

	/* add event handlers to listen to events from widgets */
	this.authorizeClicked = this.authorizeClicked.bind(this);
	Mojo.Event.listen(this.controller.get('authorize-button'), Mojo.Event.tap, this.authorizeClicked);

	this.registerClicked = this.registerClicked.bind(this);
	Mojo.Event.listen(this.controller.get('register-button'), Mojo.Event.tap, this.registerClicked);

	this.verifyClicked = this.verifyClicked.bind(this);
	Mojo.Event.listen(this.controller.get('pin-button'), Mojo.Event.tap, this.verifyClicked);

	this.unlinkClicked = this.unlinkClicked.bind(this);
	Mojo.Event.listen(this.controller.get('unlink-button'), Mojo.Event.tap, this.unlinkClicked);

	if(Geocaching.logins['twitter']['oauth_token'] != null) {
		this.controller.get('username').update(Geocaching.logins['twitter']['screen_name']);
		this.controller.get('logged').show();
	} else {
		this.controller.get('linking').show();
	}

};

LoginTwitterAssistant.prototype.activate = function(event) {
};

LoginTwitterAssistant.prototype.deactivate = function(event) {
};

LoginTwitterAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('authorize-button'), Mojo.Event.tap, this.authorizeClicked);
	Mojo.Event.stopListening(this.controller.get('register-button'), Mojo.Event.tap, this.registerClicked);
	Mojo.Event.stopListening(this.controller.get('pin-button'), Mojo.Event.tap, this.verifyClicked);
};

LoginTwitterAssistant.prototype.showPopup = function(event, title, message, negative) {
	if(negative == false) {
		Mojo.Controller.getAppController().showBanner({'messageText': message}, '', 'accounts');
		this.controller.stageController.popScene('twitter');
	} else {
		this.controller.showAlertDialog({
			'onChoose': function(value) {},
			'title': title,
			'message': message,
			'choices': [{'label': $L("Close"), 'value':negative, 'type': (negative?'negative':'primary')}]
		});
	}
}

LoginTwitterAssistant.prototype.authorizeClicked = function(event) {
	this.modelLoginButton.disabled = true;
	this.controller.modelChanged(this.modelLoginButton);

	Geocaching.accounts['twitter'].requestToken(
		{
			'retry': 1
		},
		function(parameters) {
			this.controller.get('loginform').show();
			this.controller.get('loginbuttons').hide();
			this.controller.get('authorizebuttons').show();

			this.oauth_token = parameters.match(/oauth_token=([a-z0-9\-]+)/i)[1];
			this.controller.serviceRequest('palm://com.palm.applicationManager', {
				'method': 'open',
				'parameters': {
					'id': 'com.palm.app.browser',
					'params': {
						'target': "https://twitter.com/oauth/authorize?"+parameters
					}
				}
			});
		}.bind(this),
		function(message) {
			this.showPopup(event, $L("Login"), message, true);
			this.modelLoginButton.disabled = false;
			this.controller.modelChanged(this.modelLoginButton);
		}.bind(this)
	);
};

LoginTwitterAssistant.prototype.registerClicked = function(event) {
	this.controller.serviceRequest('palm://com.palm.applicationManager', {
		'method': 'open',
		'parameters': {
			'id': 'com.palm.app.browser',
			'params': {
				'target': "https://m.twitter.com/signup"
			}
		}
	});
};

LoginTwitterAssistant.prototype.verifyClicked = function(event) {
	this.modelPinButton.disabled = true;
	this.controller.modelChanged(this.modelPinButton);

	Geocaching.accounts['twitter'].verifyPin(
		{
			'retry': 1,
			'pin': this.controller.get('inputPIN').mojo.getValue(),
			'token': this.oauth_token
		},
		function(parameters) {
			var accountInfo = parameters.match(/oauth_token=([a-z0-9\-]+)&oauth_token_secret=([a-z0-9\-]+)&user_id=([0-9]+)&screen_name=([a-z0-9_]+)/i);
			Geocaching.logins['twitter'] = {
				'oauth_token': accountInfo[1],
				'oauth_token_secret': accountInfo[2],
				'user_id': accountInfo[3],
				'screen_name': accountInfo[4]
			};

			if(this.postTweetModel['value']) {
				Geocaching.accounts['twitter'].postMessage(
					{
						'retry': 1,
						'message': $L("I'm using #Geocaching for #webOS to tweet from cache hunting!")
					},
					function() {},
					function() {}
				);
			};

			Geocaching.storage.simpleAdd('logins-twitter', Geocaching.logins['twitter'],
				function() {
					this.showPopup(event, $L("Login"), $L("Login information saved correctly!"), false);
				}.bind(this),
				function() {
					this.showPopup(event, $L("Login"), $L("Login information are correct, but cannot be saved."), false);
				}.bind(this)
			);
		}.bind(this),
		function(message) {
			this.showPopup(event, $L("Login"), message, true);
			this.modelPinButton.disabled = false;
			this.controller.modelChanged(this.modelPinButton);
		}.bind(this)
	);
}

LoginTwitterAssistant.prototype.unlinkClicked = function(event) {
	Geocaching.logins['twitter'] = {
		'oauth_token': null,
		'oauth_token_secret': null,
		'user_id': null,
		'screen_name': null
	};
	Geocaching.storage.simpleAdd('logins-twitter', Geocaching.logins['twitter'],
		function() {
			this.showPopup(event, $L("Login"), $L("Twitter account was unlinked."), false);
		}.bind(this),
		function() {
			this.showPopup(event, $L("Login"), $L("Twitter account was unlinked only for this session."), false);
		}.bind(this)
	);
}