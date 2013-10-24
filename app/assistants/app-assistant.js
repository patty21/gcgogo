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
	gblCt++;
	if (!params){
		return;
	}
//	Mojo.Log.error('params:', Object.toJSON(params));	
	gblLaunchParams = params;
	if (gblCt==1) {
		return;
	}
	
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
};



var gcGogo = {};
gcGogo.isTouchpad = function(){
	if(Mojo.Environment.DeviceInfo.modelNameAscii.indexOf("ouch")>-1){ return true; }
	if(Mojo.Environment.DeviceInfo.screenWidth==1024){ return true; }
	if(Mojo.Environment.DeviceInfo.screenHeight==1024){ return true; }
	return false;
};
