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
		'rv-yes': $L("Truck Driver/RV"),
		
		'dogs-no': $L("No dogs"),
		'bicycles-no': $L("No bicycles"),
		'motorcycles-no': $L("No motorcycles"),
		'quads-no': $L("No quads"),
		'jeeps-no': $L("No off-road Vehicles"),
		'snowmobiles-no': $L("No snowmobiles"),
		'campfires-no': $L("No campfires"),
		'horses-no': $L("No horses"),
		'rv-no': $L("No Truck Driver/RV"),
		
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
		'field_puzzle-yes': $L("Field Puzzle"),
		'nightcache-yes': $L("Night Cache"),
		'parkngrab-yes': $L("Park and Grab"),
		'AbandonedBuilding-yes': $L("Abandoned Structure"),
		'hike_short-yes': $L("Short hike"),
		'hike_med-yes': $L("Medium hike"),
		'hike_long-yes': $L("Long hike"),
		'seasonal-yes': $L("Seasonal Access"),
		'touristOK-yes': $L("Tourist Friendly"),
		'frontyard-yes': $L("Front Yard"),
		'teamwork-yes': $L("Teamwork required"),
		
		'kids-no': $L("Not recommended for kids"),
		'onehour-no': $L("Takes more than an hour"),
		'hiking-no': $L("Not significant hike"),
		'climbing-no': $L("No climbing"),
		'available-no': $L("Not available at all times"),
		'night-no': $L("Not recommended at night"),
		'winter-no': $L("Not available during winter"),
		'scenic-no': $L("No scenic view"),
		'stealth-no': $L("Stealth not required"),
		'field_puzzle-no': $L("No Field Puzzle"),
		'nightcache-no': $L("No Night Cache"),
		'parkngrab-no': $L("No Park and Grab"),
		'AbandonedBuilding-no': $L("No Abandoned Structure"),
		'hike_short-no': $L("No Short hike"),
		'hike_med-no': $L("No Medium hike"),
		'hike_long-no': $L("No Long hike"),
		'seasonal-no': $L("No Seasonal Access"),
		'touristOK-no': $L("Not Tourist Friendly"),
		'frontyard-no': $L("No Front Yard"),
		'teamwork-no': $L("Teamwork not required"),
		
		'fee-yes': $L("Access or parking fee"),
		'rappelling-yes': $L("Climbing gear"),
		'boat-yes': $L("Boat"),
		'scuba-yes': $L("Scuba gear"),
		'flashlight-yes': $L("Flashlight required"),
		'UV-yes': $L("UV Light required"),
		'snowshoes-yes': $L("Snowshoes"),
		'skiis-yes': $L("Cross Country Skis"),
		's-tool-yes': $L("Special Tool required"),
		'wirelessbeacon-yes': $L("Wireless Beacon"),
		'treeclimbing-yes': $L("Tree Climbing"),
		'treeclimbing-no': $L("No Tree Climbing"),
		
		'poisonoak-yes': $L("Poison plants"),
		'dangerousanimals-yes': $L("Dangerous animals"),
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
		'fuel-yes': $L("Fuel nearby"),
		'food-yes': $L("Food nearby"),
		
		'wheelchair-no': $L("Wheelchair inaccessible"),
		'parking-no': $L("Parking not available"),
		'water-no': $L("Don't drinking water nearby"),
		'restrooms-no': $L("No public restrooms"),
		'phone-no': $L("No elephone nearby"),
		'picnic-no': $L("No picnic tables"),
		'camping-no': $L("Camping not allowed"),
		'stroller-no': $L("Stroller inaccessible"),
		'fuel-no': $L("No Fuel nearby"),
		'food-no': $L("No Food nearby")
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
	if( gcGogo.isTouchpad() ){
		this.controller.setupWidget(Mojo.Menu.commandMenu, {'menuClass': 'no-fade'},
			this.commandMenuModel = {'items': [
				{'label': $L("Back"), 'icon': 'back', 'command': 'goback'}
			]});
	}
};

AttributesAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.command) {
		switch(event.command) {
			case 'goback':
				this.controller.stageController.popScene();
			break;
			default:
			break;
		}
	}
}

AttributesAssistant.prototype.activate = function(event) {
};

AttributesAssistant.prototype.deactivate = function(event) {
};

AttributesAssistant.prototype.cleanup = function(event) {
};
