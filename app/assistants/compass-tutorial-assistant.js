function CompassTutorialAssistant(sceneAssistant,exitFunc) {
	this.exitFunc = exitFunc;
	this.sceneAssistant = sceneAssistant;
	this.controller = sceneAssistant.controller;
}

CompassTutorialAssistant.prototype.setup = function(widget) {
	this.widget = widget;

	this.continueTap = this.continueTap.bind(this);
	
	Mojo.Event.listen(this.controller.get('continue'),Mojo.Event.tap,this.continueTap);
}

CompassTutorialAssistant.prototype.activate = function(event) {
}

CompassTutorialAssistant.prototype.deactivate = function(event) {
}

CompassTutorialAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('continue'),Mojo.Event.tap,this.continueTap);
	this.exitFunc();
}

CompassTutorialAssistant.prototype.continueTap = function(event) {
	this.widget.mojo.close();
}