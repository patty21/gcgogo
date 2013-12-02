function DescriptionAssistant(gccode) {
	this.geocode = gccode;
}

DescriptionAssistant.prototype.setup = function() {
	this.controller.get('icon').innerHTML = '<img class="gc-icon" src="images/'+ cacheTypes[cache[this.geocode].type] +'.gif" /> ';
	this.controller.get('icon').className = 'icon img';
	this.controller.get('title').update(this.geocode);
	this.controller.get('full-description').innerHTML = cache[this.geocode].description;
	
	if( gcGogo.isTouchpad() ){
		this.controller.setupWidget(Mojo.Menu.commandMenu, {'menuClass': 'no-fade'},
			this.commandMenuModel = {'items': [
				{'label': $L("Back"), 'icon': 'back', 'command': 'goback'}
			]});
	}
};

DescriptionAssistant.prototype.handleCommand = function(event) {
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

DescriptionAssistant.prototype.activate = function(event) {
}

DescriptionAssistant.prototype.deactivate = function(event) {
}

DescriptionAssistant.prototype.cleanup = function(event) {
}
