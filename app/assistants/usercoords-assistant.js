function UsercoordsAssistant(defaults, sceneAssistant,callbackFunc,exitFunc) {
	this.defaultName = defaults['name'];
	this.defaultLatitude = (typeof(defaults['lat'])=='undefined' ? '' : defaults['lat']);
	this.defaultLongitude = (typeof(defaults['lon'])=='undefined' ? '' : defaults['lon']);
	this.submitLabel = (typeof(defaults['submit'])=='undefined' ? $L("Navigate") : defaults['submit']);
	this.callbackFunc = callbackFunc;
	this.exitFunc = exitFunc;
	this.sceneAssistant = sceneAssistant;
	this.controller = sceneAssistant.controller;
}

UsercoordsAssistant.prototype.setup = function(widget) {
	this.widget = widget;

	this.controller.setupWidget('wptName',
		this.attributesWptName = {},
		this.modelWptName = {
			'value': this.defaultName,
			'disabled': false
		}
	);

	this.controller.setupWidget('latitude',
		this.attributesLatitude = {},
		this.modelLatitude = {
			'value': this.defaultLatitude,
			'disabled': false
		}
	);

	this.controller.setupWidget('longitude',
		this.attributesLongitude = {},
		this.modelLongitude = {
			'value': this.defaultLongitude,
			'disabled': false
		}
	);

	this.controller.setupWidget('navigate', {},
		{
			'label': this.submitLabel,
			'buttonClass': 'palm-button affirmative buttonfloat',
			'disabled': false
		}
	);

	this.navigate = this.navigate.bind(this);
	this.cancel = this.cancel.bind(this);
	
	Mojo.Event.listen(this.controller.get('navigate'),Mojo.Event.tap,this.navigate);
	Mojo.Event.listen(this.controller.get('cancel'),Mojo.Event.tap,this.cancel);

}

UsercoordsAssistant.prototype.activate = function(event) {
}

UsercoordsAssistant.prototype.deactivate = function(event) {
}

UsercoordsAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('navigate'),Mojo.Event.tap,this.navigate);
	Mojo.Event.stopListening(this.controller.get('cancel'),Mojo.Event.tap,this.cancel);
	this.exitFunc();
}

UsercoordsAssistant.prototype.cancel = function(event) {
	this.widget.mojo.close();
}

UsercoordsAssistant.prototype.navigate = function(event) {
	this.callbackFunc(
		this.controller.get('wptName').mojo.getValue(),
		this.controller.get('latitude').mojo.getValue(),
		this.controller.get('longitude').mojo.getValue()
	);
	this.widget.mojo.close();
}