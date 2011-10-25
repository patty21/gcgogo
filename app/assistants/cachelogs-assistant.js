function CachelogsAssistant(gccode) {
	this.geocode = gccode;
}

CachelogsAssistant.prototype.setup = function() {
	this.controller.get('icon').innerHTML = '<img class="gc-icon" src="images/'+ cacheTypes[cache[this.geocode].type] +'.gif" /> ';
	this.controller.get('icon').className = 'icon img';
	this.controller.get('title').update($L("#{geocode}'s logs").interpolate({'geocode': this.geocode}));

	this.controller.setupWidget("logs",
		this.attributes = {
			'itemTemplate': 'cachelogs/logs-item',
			'listTemplate': 'cachelogs/logs-container',
			'emptyTemplate':'cachelogs/logs-empty',
		},
		this.cacheListModel = {
			'listTitle': $L("Caches"),
			'items': cache[this.geocode].logs
		}
	);
}

CachelogsAssistant.prototype.activate = function(event) {
}

CachelogsAssistant.prototype.deactivate = function(event) {
}

CachelogsAssistant.prototype.cleanup = function(event) {
}
