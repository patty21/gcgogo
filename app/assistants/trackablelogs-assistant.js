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
	
	if( gcGogo.isTouchpad() ){
		this.controller.setupWidget(Mojo.Menu.commandMenu, {'menuClass': 'no-fade'},
			this.commandMenuModel = {'items': [
				{'label': $L("Back"), 'iconPath': 'images/menu-icon-back.png', 'command': 'goback'}
			]});
	}
};

TrackablelogsAssistant.prototype.handleCommand = function(event) {
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

TrackablelogsAssistant.prototype.activate = function(event) {
}

TrackablelogsAssistant.prototype.deactivate = function(event) {
}

TrackablelogsAssistant.prototype.cleanup = function(event) {
}
