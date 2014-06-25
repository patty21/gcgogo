function SpoilerimagesAssistant(gccode) {
	this.geocode = gccode;
}

SpoilerimagesAssistant.prototype.setup = function() {
	this.controller.get('icon').innerHTML = '<img class="gc-icon" src="images/'+ cacheTypesShort[cache[this.geocode].type] +'.gif" /> ';
	this.controller.get('icon').className = 'icon img';
	this.controller.get('title').update(this.geocode);
/*	var spimg=cache[this.geocode].spoilerImages;
	for (var z=0;z<spimg.length; z++) {
		spimg[z]['width']=Mojo.Environment.DeviceInfo.screenWidth;
	}*/
	this.controller.setupWidget('spoilerImages',
		{
			'itemTemplate': 'spoilerimages/spoilerimages-list-item',
			'listTemplate': 'spoilerimages/spoilerimages-list-container',
			'emptyTemplate':'spoilerimages/spoilerimages-list-empty'
		},
		this.imagesModel = {
			'listTitle': $L('Images'),
			'items': cache[this.geocode].spoilerImages
		}
	);

	this.openImage = this.openImage.bind(this);
	Mojo.Event.listen(this.controller.get('spoilerImages'),Mojo.Event.listTap, this.openImage);
	
	if( gcGogo.isTouchpad() ){
		this.controller.setupWidget(Mojo.Menu.commandMenu, {'menuClass': 'no-fade'},
			this.commandMenuModel = {'items': [
				{'label': $L("Back"), 'icon': 'back', 'command': 'goback'}
			]});
	}
};

SpoilerimagesAssistant.prototype.handleCommand = function(event) {
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

SpoilerimagesAssistant.prototype.activate = function(event) {
}

SpoilerimagesAssistant.prototype.deactivate = function(event) {
	Mojo.Event.stopListening(this.controller.get('spoilerImages'),Mojo.Event.listTap, this.openImage);
}

SpoilerimagesAssistant.prototype.cleanup = function(event) {

}

SpoilerimagesAssistant.prototype.openImage = function(event) {
	if(event.item['url']) {
		var url = event.item['url'];
		this.controller.serviceRequest('palm://com.palm.applicationManager', {
			'method': 'open',
			'parameters': {
				'target': url
			}
		});

		/*this.controller.serviceRequest('palm://com.palm.applicationManager', { 
			method:'launch',
			parameters: { 
				id:"com.palm.app.photos", 
				params: Object.toJSON({
					'imageName': event.item['name'],
					'imageUrl': event.item['url']
				} )
			}
		});*/
	}
}
