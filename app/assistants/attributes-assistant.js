function AttributesAssistant(gccode) {
	this.geocode = gccode;
}

AttributesAssistant.prototype.setup = function() {
	this.controller.get('title').update($L("#{geocode}'s attributes").interpolate({'geocode': this.geocode}));
	this.controller.get('icon').update('<img class="gc-icon" src="images/'+ cacheTypes[cache[this.geocode].type] +'.gif" />');
	this.controller.get('icon').className = 'icon img';

	var attrs = {
		'firstaid-yes': $L("Needs maintenance"),
		
		'dogs-yes': $L("Dogs"),
		'bicycles-yes': $L("Bicycles"),
		'motorcycles-yes': $L("Motorcycles"),
		'quads-yes': $L("Quads"),
		'jeeps-yes': $L("Off-Road Vehicles"),
		'snowmobiles-yes': $L("Snowmobiles"),
		'campfires-yes': $L("Campfires"),
		'horses-yes': $L("Horses"),
		'dogs-no': $L("No dogs"),
		'bicycles-no': $L("No bicycles"),
		'motorcycles-no': $L("No motorcycles"),
		'quads-no': $L("No quads"),
		'jeeps-no': $L("No off-road Vehicles"),
		'snowmobiles-no': $L("No snowmobiles"),
		'campfires-no': $L("No campfires"),
		'horses-no': $L("No horses"),
		
		'kids-yes': $L("Recommended for kids"),
		'onehour-yes': $L("Takes less than an hour"),
		'hiking-yes': $L("Significant hike"),
		'climbing-yes': $L("Difficult climbing"),
		'wading-yes': $L("May require wading"),
		'swimming-yes': $L("May require swimming"),
		'available-yes': $L("Available at all times"),
		'night-yes': $L("Recommended at night"),
		'winter-yes': $L("Available during winter"),
		'scenic-yes': $L("Scenic view"),
		'stealth-yes': $L("Stealth required"),
		'cow-yes': $L("Watch for livestock"),
		'kids-no': $L("Not recommended for kids"),
		'onehour-no': $L("Takes more than an hour"),
		'hiking-no': $L("Not significant hike"),
		'climbing-no': $L("No climbing"),
		'available-no': $L("Not available at all times"),
		'night-no': $L("Not recommended at night"),
		'winter-no': $L("Not available during winter"),
		'scenic-no': $L("No scenic view"),
		'stealth-no': $L("Stealth not required"),
		
		'fee-yes': $L("Access or parking fee"),
		'rappelling-yes': $L("Climbing gear"),
		'boat-yes': $L("Boat"),
		'scuba-yes': $L("Scuba gear"),
		'flashlight-yes': $L("Flashlight required"),
		
		'poisonoak-yes': $L("Poison plants"),
		'snakes-yes': $L("Snakes"),
		'ticks-yes': $L("Ticks"),
		'mine-yes': $L("Abandoned mines"),
		'cliff-yes': $L("Cliff / falling rocks"),
		'hunting-yes': $L("Hunting"),
		'danger-yes': $L("Dangerous area"),
		'thorn-yes': $L("Thorns"),
		'poisonoak-no': $L("No poison plants"),
		
		'wheelchair-yes': $L("Wheelchair accessible"),
		'parking-yes': $L("Parking available"),
		'public-yes': $L("Public transportation"),
		'water-yes': $L("Drinking water nearby"),
		'restrooms-yes': $L("Public restrooms nearby"),
		'phone-yes': $L("Telephone nearby"),
		'picnic-yes': $L("Picnic tables nearby"),
		'camping-yes': $L("Camping available"),
		'stroller-yes': $L("Stroller accessible"),
		'wheelchair-no': $L("Wheelchair inaccessible"),
		'parking-no': $L("Parking not available"),
		'water-no': $L("Don't drinking water nearby"),
		'restrooms-no': $L("No public restrooms"),
		'phone-no': $L("No elephone nearby"),
		'picnic-no': $L("No picnic tables"),
		'camping-no': $L("Camping not allowed"),
		'stroller-no': $L("Stroller inaccessible")
	};
	
	var attr_list = new Array(), img;
	var atCount = cache[this.geocode].attrs.length;
	if(atCount) {
		for(var i=0; i<atCount; i++) {
			img = cache[this.geocode].attrs[i]['img'];
			attr_list.push({
				'img': img,
				'description': attrs[img]
			});
		}
	};
	
	this.controller.setupWidget('attrs-list',
		this.attributes = {
			'itemTemplate': 'attributes/list-item',
			'listTemplate': 'attributes/list-container',
			'emptyTemplate': 'attributes/list-empty'
		},
		this.cacheListModel = {
			'listTitle': $L("Attributes"),
			'items' : attr_list
		}
	);
};

AttributesAssistant.prototype.activate = function(event) {
};

AttributesAssistant.prototype.deactivate = function(event) {
};

AttributesAssistant.prototype.cleanup = function(event) {
};
