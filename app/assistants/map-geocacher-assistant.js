function MapGeocacherAssistant(params, sceneAssistant,callbackFunc,exitFunc) {
	this.geocacher = params['username'];
	this.located = params['located'];
	this.client = params['client'];
	this.callbackFunc = callbackFunc;
	this.exitFunc = exitFunc;
	this.sceneAssistant = sceneAssistant;
	this.controller = sceneAssistant.controller;
}

MapGeocacherAssistant.prototype.setup = function(widget) {
	this.widget = widget;
	
	var clients = {
		'c:geo': 'cgeo.png',
		'preCaching': 'precaching.png',
		'Handy Geocaching': 'handygeocaching.png'
	}
	
	this.controller.get('title').update(this.geocacher);
	this.controller.get('timedelta').update($L("#{timedelta} ago").interpolate({'timedelta': this.located}));
	this.controller.get('client').src = 'images/go4cache/'+ clients[this.client];
	this.close = this.close.bind(this);
	
	Mojo.Event.listen(this.controller.get('close'),Mojo.Event.tap,this.close);

}

MapGeocacherAssistant.prototype.activate = function(event) {
}

MapGeocacherAssistant.prototype.deactivate = function(event) {
}

MapGeocacherAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('close'),Mojo.Event.tap,this.close);
	this.exitFunc();
}

MapGeocacherAssistant.prototype.close = function(event) {
	this.widget.mojo.close();
}

MapGeocacherAssistant.prototype.navigate = function(event) {
	this.callbackFunc(
/*		this.controller.get('wptName').mojo.getValue(),
		this.controller.get('latitude').mojo.getValue(),
		this.controller.get('longitude').mojo.getValue()*/
	);
	this.widget.mojo.close();
}