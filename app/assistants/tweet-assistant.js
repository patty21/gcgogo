function TweetAssistant(tweet) {
	this.tweet = '';
	if(tweet) {
		this.tweet = tweet;
	}
}

TweetAssistant.prototype.setup = function() {

	this.latitude = false;
	this.longitude = false;

	this.controller.setupWidget('tweet',
		this.attributesPin = {
			'hintText': '',
			'textFieldName':  'tweet',
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
		this.modelPin = {
			'value': this.tweet,
			'disabled': false
		}
	);

	this.controller.setupWidget('tweet-button',
		{
			'type': Mojo.Widget.activityButton
		},
		this.modelTweetButton = {
			'buttonLabel': $L("Tweet"),
			'buttonClass': 'affirmative',
			'disabled': false
		}
	);

	this.tweetClicked = this.tweetClicked.bind(this);
	Mojo.Event.listen(this.controller.get('tweet-button'), Mojo.Event.tap, this.tweetClicked);

	// Get current position for tweet
	this.controller.serviceRequest('palm://com.palm.location', {
		'method': 'getCurrentPosition',
		'parameters': {
			'accuracy': 1,
			'responseTime': 1,
			'maximumAge': 60,
		},
		'onSuccess': this.setTweetPosition.bind(this),
	});

};

TweetAssistant.prototype.activate = function(event) {
};

TweetAssistant.prototype.deactivate = function(event) {
};

TweetAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('tweet-button'), Mojo.Event.tap, this.tweetClicked);
};

TweetAssistant.prototype.showPopup = function(event, title, message, negative) {
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

TweetAssistant.prototype.setTweetPosition = function(event) {
	var accuracy = event.horizAccuracy;
	if(!accuracy) {
		this.actionNearestFailed(event);
	}
	this.latitude = event.latitude;
	this.longitude = event.longitude;
	
	// Share GPS location
	if(Geocaching.settings['go4cache']) {
		Geocaching.accounts['go4cache'].sendLocation(this.latitude, this.longitude, 'tweeting');
	}

	
}

TweetAssistant.prototype.tweetClicked = function(event) {
	this.modelTweetButton.disabled = true;
	this.controller.modelChanged(this.modelTweetButton);

	this.tweet = this.controller.get('tweet').mojo.getValue();
	if(this.tweet.length > 140) {
		this.modelTweetButton.disabled = false;
		this.controller.modelChanged(this.modelTweetButton);

		this.showPopup(
			event,
			$L("Tweet problem"),
			$L("Tweet cannot be longer, than 140 characters"),
			true
		);
		return false;
	}

	Geocaching.accounts['twitter'].postMessage(
		{
			'retry': 1,
			'message': this.tweet,
			'latitude': this.latitude,
			'longitude': this.longitude,
		},
		function() {
			this.showPopup(
				event,
				$L("Tweet"),
				$L("Tweet posted."),
				false
			);
		}.bind(this),
		function(message) {
			this.showPopup(
				event,
				$L("Tweet problem"),
				message,
				true
			);
		}.bind(this)
	);

	
}
