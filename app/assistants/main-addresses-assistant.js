function MainAddressesAssistant(addresses, sceneAssistant,callbackFunc) {
	this.addresses = addresses;
	this.callbackFunc = callbackFunc;
	this.sceneAssistant = sceneAssistant;
	this.controller = sceneAssistant.controller;
}

MainAddressesAssistant.prototype.setup = function(widget) {
	this.widget = widget;

	this.controller.setupWidget('addresses',
		this.attributes = {
			itemTemplate: 'main/addresses-list-item',
			listTemplate: 'main/addresses-list-container',
			emptyTemplate:'main/addresses-list-empty'
		},
		this.addressesModel = {
			listTitle: $L('Addresses'),
			items : this.addresses
		}
	);

	this.controller.setupWidget('vert_scroller', {}, {'scrollbars':false, 'mode':'vertical'});

	this.handleAddressListTap = this.handleAddressListTap.bindAsEventListener(this);
	Mojo.Event.listen(this.controller.get('addresses'),Mojo.Event.listTap, this.handleAddressListTap);

	this.cancel = this.cancel.bind(this);
	Mojo.Event.listen(this.controller.get('cancel'),Mojo.Event.tap,this.cancel);

}

MainAddressesAssistant.prototype.activate = function(event) {
}

MainAddressesAssistant.prototype.deactivate = function(event) {
}

MainAddressesAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('cancel'),Mojo.Event.tap,this.cancel);
}

MainAddressesAssistant.prototype.cancel = function(event) {
	this.widget.mojo.close();
}

MainAddressesAssistant.prototype.handleAddressListTap = function(event) {
	this.callbackFunc(event.item['latitude'], event.item['longitude']);
	this.widget.mojo.close();
}

