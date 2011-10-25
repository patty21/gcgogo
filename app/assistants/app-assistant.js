function AppAssistant(controller) {
	this.appController = controller;
};

AppAssistant.prototype.setup = function() {
};

AppAssistant.prototype.handleLaunch = function(params) {
	if (!params){
		return;
	}
		
	Mojo.Log.error('Input parameters: %j', params);
	
	var stageController = this.controller.getActiveStageController();
	if(!!stageController) {
		// Push scene from input parameters
		if(typeof(params['scene']) != 'undefined') {
			stageController.pushScene(params['scene']);
		}
	}
};
