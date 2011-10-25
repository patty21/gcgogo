function TrackablelogsAssistant(tbcode) {
	this.tbcode = tbcode;
}

TrackablelogsAssistant.prototype.setup = function() {
	this.controller.get('icon').innerHTML = '<img class="gc-icon" src="http://www.geocaching.com/images/wpttypes/'+ trackable[this.tbcode].type +'.gif" /> ';
	this.controller.get('icon').className = 'icon img';
	this.controller.get('title').update($L("#{tbcode}'s logs").interpolate({'tbcode': this.tbcode}));

	this.controller.setupWidget('logs',
		this.attributes = {
			'itemTemplate': 'trackablelogs/logs-item',
			'listTemplate': 'trackablelogs/logs-container',
			'emptyTemplate':'trackablelogs/logs-empty',
		},
		this.trackableListModel = {
			'listTitle': $L("Logs"),
			'items': trackable[this.tbcode].logs
		}
	);
}

TrackablelogsAssistant.prototype.activate = function(event) {
}

TrackablelogsAssistant.prototype.deactivate = function(event) {
}

TrackablelogsAssistant.prototype.cleanup = function(event) {
}
