function AccountsNewAssistant(sceneAssistant) {
	this.sceneAssistant = sceneAssistant;
	this.controller = sceneAssistant.controller;
}

AccountsNewAssistant.prototype.setup = function(widget) {
	this.widget = widget;

	this.controller.setupWidget('button-geocachingcom', {},
		{
			'label': $L("Geocaching.com"),
			'buttonClass': 'affirmative no-text-transform',
			'disabled': (Geocaching.login['username'] != null && Geocaching.login['password'])
		}
	);

	this.controller.setupWidget('button-twitter', {},
		{
			'label': $L("Twitter"),
			'buttonClass': 'primary no-text-transform',
			'disabled': (Geocaching.logins['twitter']['oauth_token'] != null)
		}
	);


	this.controller.setupWidget('button-cancel', {},
		{
			'label': $L("Cancel"),
			'buttonClass': 'negative',
			'disabled': false
		}
	);

	this.geocachingcomTap = this.geocachingcomTap.bind(this);
	Mojo.Event.listen(this.controller.get('button-geocachingcom'), Mojo.Event.tap, this.geocachingcomTap);

	this.twitterTap = this.twitterTap.bind(this);
	Mojo.Event.listen(this.controller.get('button-twitter'), Mojo.Event.tap, this.twitterTap);

	this.cancelTap = this.cancelTap.bind(this);
	Mojo.Event.listen(this.controller.get('button-cancel'), Mojo.Event.tap, this.cancelTap);
}

AccountsNewAssistant.prototype.activate = function(event) {
}

AccountsNewAssistant.prototype.deactivate = function(event) {
}

AccountsNewAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('button-geocachingcom'), Mojo.Event.tap, this.geocachingcomTap);
	Mojo.Event.stopListening(this.controller.get('button-twitter'), Mojo.Event.tap, this.twitterTap);
	Mojo.Event.stopListening(this.controller.get('button-cancel'), Mojo.Event.tap, this.cancelTap);
}

AccountsNewAssistant.prototype.geocachingcomTap = function(event) {
	this.controller.stageController.pushScene('login');
}

AccountsNewAssistant.prototype.twitterTap = function(event) {
	this.controller.stageController.pushScene('login-twitter');
}

AccountsNewAssistant.prototype.cancelTap = function(event) {
	this.widget.mojo.close();
}


