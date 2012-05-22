function LoginAssistant() {}

LoginAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	var username = '';
	if(Geocaching.login['username'] !== null) {
		username = Geocaching.login['username'];
	}
	var password = '';
	if(Geocaching.login['password'] !== null) {
		password = Geocaching.login['password'];
	}
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	/* Login */
	this.controller.setupWidget('inputUsername',
		this.attributesUsername = {
			hintText: $L("geocaching.com username"),
			textFieldName:  'name',
			multiline:              false,
			disabledProperty: 'disabled',
			focus:                  true,
			modifierState:  Mojo.Widget.capsLock,
			limitResize:    false,
			holdToEnable:  false,
			focusMode: Mojo.Widget.focusSelectMode,
			changeOnKeyPress: true,
			textReplacement: false,
			maxLength: 64,
			requiresEnterKey: false
		},
		this.modelUsername = {
			'value' : username,
			disabled: false
		}
	);

	this.controller.setupWidget('inputPassword',
		this.attributesPassworde = {
			hintText: '',
			textFieldName:  'password',
		},
		this.modelPassword = {
			'value' : password,
			disabled: false
		}
	);

	this.controller.setupWidget('login-button',
		this.attributesLoginButton = {
			type: Mojo.Widget.activityButton
		},
		this.modelLoginButton = {
			buttonLabel: $L("Save & login"),
			buttonClass: 'affirmative',
			disabled: false
		}
	);	
	this.controller.setupWidget('register-button',
		{},
		this.modelRegisterButton = {
			buttonLabel: $L("Sign up"),
			buttonClass: 'primary',
			disabled: false
		}
	);	

	/* add event handlers to listen to events from widgets */
	this.loginClicked = this.loginClicked.bind(this);
	Mojo.Event.listen(this.controller.get('login-button'), Mojo.Event.tap, this.loginClicked);

	this.registerClicked = this.registerClicked.bind(this);
	Mojo.Event.listen(this.controller.get('register-button'), Mojo.Event.tap, this.registerClicked);
}

LoginAssistant.prototype.activate = function(event) {
}


LoginAssistant.prototype.deactivate = function(event) {
}

LoginAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('login-button'), Mojo.Event.tap, this.loginClicked);
	Mojo.Event.stopListening(this.controller.get('register-button'), Mojo.Event.tap, this.registerClicked);
}

LoginAssistant.prototype.showPopup = function(event, title, message, negative) {
	if(negative == false) {
		Mojo.Controller.getAppController().showBanner({'messageText': message}, '', 'accounts');
		this.controller.stageController.popScene('geocaching.com');
	} else {
		this.controller.showAlertDialog({
			'onChoose': function(value) {},
			'title': title,
			'message': message,
			'choices': [{'label': $L("Close"), 'value':negative, 'type': (negative?'negative':'primary')}]
		});
	}
}

/* Universal function to reenable login button */
LoginAssistant.prototype.enableButton = function() {
	this.modelLoginButton.disabled = false;
	this.controller.modelChanged(this.modelLoginButton);
	this.controller.get('login-button').mojo.deactivate();
}

LoginAssistant.prototype.loginClicked = function(event) {
	/* Disable login button */
	this.modelLoginButton.disabled = true;
	this.controller.modelChanged(this.modelLoginButton);

	/* Check for mandatory inputs */
	var user = this.controller.get('inputUsername').mojo.getValue();
	if ('' == user) {
		this.enableButton();
		this.showPopup(event, $L("Login"), $L("Username cannot be empty!"), true);
		return false;
	}
	
	var pass = this.controller.get('inputPassword').mojo.getValue();
	if ('' == pass) {
		this.enableButton();
		this.showPopup(event, $L("Login"), $L("Password cannot be empty!"), true);
		return false;
	}
	// Login
	Geocaching.accounts['geocaching.com'].doLogin(this.controller.get('inputUsername').mojo.getValue(), this.controller.get('inputPassword').mojo.getValue(),
		function() {
			this.enableButton();
			Geocaching.login['username'] = this.controller.get('inputUsername').mojo.getValue();
			Geocaching.login['password'] = this.controller.get('inputPassword').mojo.getValue();
			Geocaching.storage.simpleAdd('login', {
					'username': this.controller.get('inputUsername').mojo.getValue(),
					'password': this.controller.get('inputPassword').mojo.getValue(),
					'uid': ''
					},
				function() {
					Geocaching.accounts['geocaching.com'].getUID(
						function(uid) {
							Mojo.Log.info(uid);
							Geocaching.login['uid']	= uid;
							Geocaching.storage.simpleAdd('login', Geocaching.login);
						}
					);
					this.showPopup(event, $L("Login"), $L("Login information saved correctly!"), false);
				}.bind(this),
				function() {
					this.showPopup(event, $L("Login"), $L("Login information are correct, but cannot be saved."), false);
				}.bind(this)
			);
			Geocaching.ownfinds = {};
			Geocaching.storage.simplaadd('ownfinds',Geocaching.ownfinds,
				function() {}.bind(this),
				function() {}.bind(this)
			);
		}.bind(this),
		function(message) {
			this.enableButton();
			this.showPopup(event, $L("Login"), message, true);
		}.bind(this)
	);
}
LoginAssistant.prototype.registerClicked = function(event) {
	this.controller.serviceRequest('palm://com.palm.applicationManager', {
		'method': 'open',
		'parameters': {
			'id': 'com.palm.app.browser',
			'params': {
				'target': "https://www.geocaching.com/membership/default.aspx"
			}
		}
	});
}
