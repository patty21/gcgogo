function GalleryimagesAssistant(gccode) {
	this.geocode = gccode;
}

GalleryimagesAssistant.prototype.setup = function() {

	this.controller.get('icon').innerHTML = '<img class="gc-icon" src="images/'+ cacheTypes[cache[this.geocode].type] +'.gif" /> ';
	this.controller.get('icon').className = 'icon img';
	this.controller.get('title').update($L("#{geocode}'s images").interpolate({'geocode': this.geocode}));
	
	var attributes = {
		'itemTemplate': 'galleryimages/galleryimages-list-item',
		'listTemplate': 'galleryimages/galleryimages-list-container',
		'emptyTemplate':'galleryimages/galleryimages-list-empty'
	};
	
	// Remove spoiler images from galleryImages
	var galleryImages =  new Array();
	var spoilerImagesUrls = new Array();
	for(var item in cache[this.geocode].spoilerImages) {
		spoilerImagesUrls.push(cache[this.geocode].spoilerImages[item]['url']);
	}
	
	for(var item in cache[this.geocode].galleryImages) {
		if(spoilerImagesUrls.indexOf(cache[this.geocode].galleryImages[item]['url']) == -1) {
			galleryImages.push(cache[this.geocode].galleryImages[item]);
		}
	}
	
 	this.imagesModel = {
		'listTitle': $L('Images'),
		'items': galleryImages
 	};

	this.controller.setupWidget('galleryImages', attributes, this.imagesModel); 
	
	this.openImage = this.openImage.bind(this);
	Mojo.Event.listen(this.controller.get('galleryImages'),Mojo.Event.listTap, this.openImage);

	if(cache[this.geocode].galleryImages.length !== 0) {
		this.updateGalleryDetail(this.geocode);
	} else {
		// Load image list
		Geocaching.accounts['geocaching.com'].loadImages({'geocode': this.geocode},
			this.updateGalleryDetail.bind(this),
			function(message) {
				this.showPopup(null, $L("Problem"), message, function() { Mojo.Controller.stageController.popScene(); });
				return false;
			}.bind(this)
		);
	}
};

GalleryimagesAssistant.prototype.activate = function(event) {
};

GalleryimagesAssistant.prototype.deactivate = function(event) {
	Mojo.Event.stopListening(this.controller.get('galleryImages'),Mojo.Event.listTap, this.openImage);
};

GalleryimagesAssistant.prototype.cleanup = function(event) {
};

GalleryimagesAssistant.prototype.updateGalleryDetail = function(geocode) {
	this.imagesModel.items = cache[this.geocode].galleryImages;
	this.controller.modelChanged(this.imagesModel);
};

GalleryimagesAssistant.prototype.openImage = function(event) {
	if(event.item['url']) {
		var url = event.item['url'];
		this.controller.serviceRequest('palm://com.palm.applicationManager', {
			'method': 'open',
			'parameters': {
				'target': url
			}
		});
	}
};

