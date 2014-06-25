function CachelogsAssistant(gccode) {
	this.geocode = gccode;
}

CachelogsAssistant.prototype.setup = function() {
	this.controller.get('icon').innerHTML = '<img class="gc-icon" src="images/'+ cacheTypesShort[cache[this.geocode].type] +'.gif" /> ';
	this.controller.get('icon').className = 'icon img';
	this.controller.get('title').update($L("#{geocode}'s logs").interpolate({'geocode': this.geocode}));

	this.controller.setupWidget("logs",
		this.attributes = {
			'itemTemplate': 'cachelogs/logs-item',
			'listTemplate': 'cachelogs/logs-container',
			'emptyTemplate':'cachelogs/logs-empty',
		},
		this.cacheListModel = {
			'listTitle': $L("Caches"),
			'items': cache[this.geocode].logs
		}
	);
	
	if( gcGogo.isTouchpad() ){
		this.controller.setupWidget(Mojo.Menu.commandMenu, {'menuClass': 'no-fade'},
			this.commandMenuModel = {'items': [
				{'label': $L("Back"), 'icon': 'back', 'command': 'goback'}
			]});
	}
}

CachelogsAssistant.prototype.handleCommand = function(event) {
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

CachelogsAssistant.prototype.activate = function(event) {
}

CachelogsAssistant.prototype.deactivate = function(event) {
}

CachelogsAssistant.prototype.cleanup = function(event) {
}
