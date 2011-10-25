function FirstAssistant() {
}

FirstAssistant.prototype.setup = function() {
	this.controller.setupWidget('loading-spinner', 
		this.spinnerLAttrs = {
			'spinnerSize': 'large'
		},
		this.spinnerModel = {
			'spinning': true
		}
	);

};

FirstAssistant.prototype.activate = function(event) {
};

FirstAssistant.prototype.deactivate = function(event) {
	this.controller.get('loading-spinner').hide();
};

FirstAssistant.prototype.cleanup = function(event) {
};
