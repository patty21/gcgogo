Twitter  = function() {
	this.consumerKey = '2fiArqfEkulLnNwxOCvptg';
	this.consumerSecret = 'fIj8gYddj2fx7JXwocMw1zcRa3POnfGm0VfZvsF3w4';
};

Twitter.prototype.requestToken = function(params, success, failure) {
	var timeout = Geocaching.settings['firstTimeout'];
	if(typeof(params['retry']) != 'undefined' && params['retry']>1) {
		var timeout = Geocaching.settings['secondTimeout'];
	} else {
		params['retry'] = 1;
	}

	var url = "http://twitter.com/oauth/request_token";
	var ajaxId = 'twitter-request-token';

	var accessor = {
		'consumerSecret': this.consumerSecret,
		'tokenSecret': ''
	};
    var message = {
		'action': url,
		'method': 'get',
		'parameters': []
	};

	message.parameters.push(['oauth_consumer_key', this.consumerKey]);
	message.parameters.push(['oauth_callback', 'oob']);

	OAuth.setTimestampAndNonce(message);
	OAuth.SignatureMethod.sign(message, accessor);
	var parameterMap = OAuth.getParameterMap(message.parameters);

	Geocaching.ajaxRequests[ajaxId] = new Ajax.Request(url, {
		'method': 'get',
		'parameters': OAuth.getParameterMap(message.parameters),
		'evalJSON': 'force',
		'onSuccess': function(r){
			Geocaching.lastAjaxId = null;
			delete(Geocaching.ajaxRequests[ajaxId]);
			success(r.responseText);
		}.bind(this),
		onFailure: function(r){
//			failure($L("Error occured on requesting Twitter token."));
			failure($L("Twitter support is temporarily disabled."));
		}
	});
	Geocaching.lastAjaxId = ajaxId;

	window.setTimeout(function(ajaxId, params, success, failure) {
		if(Ajax.activeRequestCount > 0 && ajaxId == Geocaching.lastAjaxId) {
			Geocaching.ajaxRequests[ajaxId].abort();
			delete(Geocaching.ajaxRequests[ajaxId]);

			if(params['retry']>1) {
				failure($L("Operation timeout"));
			} else {
				Mojo.Controller.getAppController().showBanner({messageText: $L("Getting token from Twitter failed ...")}, '', 'twitter');
				params['retry']++;
				this.requestToken(params, success, failure);
			}
		}
	}.bind(this), timeout*1000, ajaxId, params, success, failure);
};

Twitter.prototype.verifyPin = function(params, success, failure) {
	var timeout = Geocaching.settings['firstTimeout'];
	if(typeof(params['retry']) != 'undefined' && params['retry']>1) {
		var timeout = Geocaching.settings['secondTimeout'];
	} else {
		params['retry'] = 1;
	}

	var url = "http://twitter.com/oauth/access_token";
	var ajaxId = 'twitter-access-token';

	var accessor = {
		'consumerSecret': this.consumerSecret,
		'tokenSecret': ''
	};
    var message = {
		'action': url,
		'method': 'get',
		'parameters': []
	};

	message.parameters.push(['oauth_token', params['token']]);
	message.parameters.push(['oauth_verifier', params['pin']]);

	OAuth.setTimestampAndNonce(message);
	OAuth.SignatureMethod.sign(message, accessor);
	var parameterMap = OAuth.getParameterMap(message.parameters);

	Geocaching.ajaxRequests[ajaxId] = new Ajax.Request(url, {
		'method': 'get',
		'parameters': OAuth.getParameterMap(message.parameters),
		'evalJSON': 'force',
		'onSuccess': function(r){
			Geocaching.lastAjaxId = null;
			delete(Geocaching.ajaxRequests[ajaxId]);
			success(r.responseText);
		}.bind(this),
		onFailure: function(r){
			failure($L("Authorization expired or PIN is incorrect."));
		}
	});
	Geocaching.lastAjaxId = ajaxId;

	window.setTimeout(function(ajaxId, params, success, failure) {
		if(Ajax.activeRequestCount > 0 && ajaxId == Geocaching.lastAjaxId) {
			Geocaching.ajaxRequests[ajaxId].abort();
			delete(Geocaching.ajaxRequests[ajaxId]);

			if(params['retry']>1) {
				failure($L("Operation timeout"));
			} else {
				Mojo.Controller.getAppController().showBanner({messageText: $L("Getting token from Twitter failed ...")}, '', 'twitter');
				params['retry']++;
				this.requestToken(params, success, failure);
			}
		}
	}.bind(this), timeout*1000, ajaxId, params, success, failure);
};

Twitter.prototype.postMessage = function(params, success, failure) {
	var timeout = Geocaching.settings['firstTimeout'];
	if(typeof(params['retry']) != 'undefined' && params['retry']>1) {
		var timeout = Geocaching.settings['secondTimeout'];
	} else {
		params['retry'] = 1;
	}

	var url = "https://twitter.com/statuses/update.json";
	var ajaxId = 'twitter-access-token';

	var accessor = {
		'consumerSecret': this.consumerSecret,
		'tokenSecret': Geocaching.logins['twitter']['oauth_token_secret']
	};
    var message = {
		'action': url,
		'method': 'post',
		'parameters': []
	};

	message.parameters.push(['oauth_token', Geocaching.logins['twitter']['oauth_token']]);
	message.parameters.push(['oauth_consumer_key', this.consumerKey]);
	message.parameters.push(['status', params['message']]);

	// Tweet GPS position
	if(params['latitude'] && params['longitude']) {
		message.parameters.push(['lat', params['latitude']]);
		message.parameters.push(['long', params['longitude']]);
	}

	OAuth.setTimestampAndNonce(message);
	OAuth.SignatureMethod.sign(message, accessor);
	var parameterMap = OAuth.getParameterMap(message.parameters);

	Geocaching.ajaxRequests[ajaxId] = new Ajax.Request(url, {
		'method': 'post',
		'parameters': OAuth.getParameterMap(message.parameters),
		'evalJSON': 'force',
		'onSuccess': function(r){
			Geocaching.lastAjaxId = null;
			delete(Geocaching.ajaxRequests[ajaxId]);
			success(r.responseJSON);
		}.bind(this),
		onFailure: function(r){
			failure($L("Authorization expired or PIN is incorrect."));
		}
	});
	Geocaching.lastAjaxId = ajaxId;

	window.setTimeout(function(ajaxId, params, success, failure) {
		if(Ajax.activeRequestCount > 0 && ajaxId == Geocaching.lastAjaxId) {
			Geocaching.ajaxRequests[ajaxId].abort();
			delete(Geocaching.ajaxRequests[ajaxId]);

			if(params['retry']>1) {
				failure($L("Operation timeout"));
			} else {
				Mojo.Controller.getAppController().showBanner({messageText: $L("Getting token from Twitter failed ...")}, '', 'twitter');
				params['retry']++;
				this.requestToken(params, success, failure);
			}
		}
	}.bind(this), timeout*1000, ajaxId, params, success, failure);
};
