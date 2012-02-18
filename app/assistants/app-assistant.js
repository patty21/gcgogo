var gblLaunchParams;
var gblStageController;
var MainStageName = "main";
var gblCt = 0;

function AppAssistant(controller) {
	this.appController = controller;
};

AppAssistant.prototype.setup = function() {
};

AppAssistant.prototype.handleLaunch = function(params) {
	if (!params){
		return;
	}
	Mojo.Log.error('params:', Object.toJSON(params));	
	gblCt++;
	var stageController = this.controller.getActiveStageController();
	if(!!stageController) {
		// Push scene from input parameters
		if(typeof(params['scene']) != 'undefined') {
			stageController.pushScene(params['scene']);
		}
	}
	
	Mojo.Log.error('1');
	gblLaunchParams = params;
	
	
  // Look for an existing main stage by name.
  var stageProxy = this.controller.getStageProxy(MainStageName);
  var stageController = this.controller.getStageController(MainStageName);
  if (stageProxy) {
      // If the stage exists, just bring it to the front by focusing its window.
      // Or, if it is just the proxy, then it is being focused, so exit.
      if (stageController) {
          stageController.activate();
      }
  } else {
      // Create a callback function to set up the new main stage
      // after it is done loading. It is passed the new stage controller
      // as the first parameter.
      var pushMainScene = function(stageController) {
      	    if (typeof(gblLaunchParams['gcid']) != 'undefined') {
		 stageController.pushScene('cache',gblLaunchParams['gcid']);
		} else {
		    stageController.pushScene(MainStageName);
		}
      };
      var stageArguments = {name: MainStageName+gblCt, lightweight: true};
      // Specify the stage type with the last property.
      this.controller.createStageWithCallback(stageArguments, pushMainScene, "card");
  }

	
	

/*

	var stageProxy = this.controller.getStageProxy("main");
//	stageController = this.controller.getStageController("main");
	if(stageController) {
		Mojo.Log.error('2');
	}
	
	if(gblStageController && typeof(params['gcid']) != 'undefined') {
//		gblStageController.window.focus();
		Mojo.Log.error('3');
//		gblStageController.pushScene('cache',params['gcid']);
	}
	gblLaunchParams = params;
*/
};
