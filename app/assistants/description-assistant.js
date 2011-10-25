function DescriptionAssistant(gccode) {
	this.geocode = gccode;
}

DescriptionAssistant.prototype.setup = function() {
	this.controller.get('icon').innerHTML = '<img class="gc-icon" src="images/'+ cacheTypes[cache[this.geocode].type] +'.gif" /> ';
	this.controller.get('icon').className = 'icon img';
	this.controller.get('title').update(this.geocode);
	this.controller.get('full-description').innerHTML = cache[this.geocode].description;
}

DescriptionAssistant.prototype.activate = function(event) {
}

DescriptionAssistant.prototype.deactivate = function(event) {
}

DescriptionAssistant.prototype.cleanup = function(event) {
}
