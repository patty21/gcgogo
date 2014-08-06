function SpoilerimagesAssistant(gccode) {
	this.geocode = gccode;
}

SpoilerimagesAssistant.prototype.setup = function() {
	this.controller.get('icon').innerHTML = '<img class="gc-icon" src="images/'+ cacheTypesShort[cache[this.geocode].type] +'.gif" /> ';
	this.controller.get('icon').className = 'icon img';
	this.controller.get('title').update(this.geocode);
	this.photos=cache[this.geocode].spoilerImages;
	this.num=0;
	this.idx=0;
	
	this.leftHandler = this.onLeft.bind(this);
	this.rightHandler = this.onRight.bind(this);

	this.imageView = this.controller.get('imageViewer');

	this.controller.setupWidget('imageViewer',
		{
		noExtractFS : true,
		highResolutionLoadTimeout: 3,
		limitZoom: false
		},
		{
		onLeftFunction: this.leftHandler,
		onRightFunction: this.rightHandler
		}
	);


	this.checkImage();

};

SpoilerimagesAssistant.prototype.checkImage = function() {
//	Mojo.Log.error("Check_Image:"+this.num);
	var targetdir = ImageDir+this.geocode.substr(0,4)+"/"+this.geocode+"/";
	var targetfile = this.geocode+"-"+this.num+".jpg";
	var request = new Ajax.Request(targetdir+targetfile, {
        	method: "get",
        	onSuccess: function(r) {
			if (r.status==200) {
				Mojo.Log.info("Image "+this.num+": local");
				this.photos[this.num]['url']=ImageDir+this.geocode.substr(0,4)+"/"+this.geocode+"/"+this.geocode+"-"+this.num+".jpg";
			} else {
				Mojo.Log.info("Image "+this.num+": web");
			}
			this.num++;
			if (this.num<this.photos.length) {
				this.checkImage();
			} else {
				this.showImages();
			}
		}.bind(this),
        	onFailure: function() {
			Mojo.Log.info("Image "+this.num+": error");
			this.num++;
			if (this.num<this.photos.length) {
				this.checkImage();
			} else {
				this.showImages();
			}
		}.bind(this)
    	});
}

SpoilerimagesAssistant.prototype.showImages = function() {
	this.controller.get("title").innerHTML = this.photos[this.idx].name;
	this.updateImages();
	if( gcGogo.isTouchpad() ){
		this.controller.setupWidget(Mojo.Menu.commandMenu, {'menuClass': 'no-fade'},
			this.commandMenuModel = {'items': [
				{'label': $L("Back"), 'icon': 'back', 'command': 'goback'}
			]});
	}
}

SpoilerimagesAssistant.prototype.onLeft = function() {
	if (this.idx > 0) {
		this.idx--;
	}
	this.updateImages();
};

SpoilerimagesAssistant.prototype.onRight = function() {
	if (this.idx < (this.photos.length-1)) {
		this.idx++;
	}
	this.updateImages();
};



SpoilerimagesAssistant.prototype.updateImages = function() {
	try {
		if (this.idx > 0) {
			this.imageView.mojo.leftUrlProvided(this.photos[this.idx-1].url);
		} else {
			this.imageView.mojo.leftUrlProvided("");
		}
		this.imageView.mojo.centerUrlProvided(this.photos[this.idx].url);
		this.controller.get("title").innerHTML = (this.idx+1) + "/" + this.photos.length + " " + this.photos[this.idx].name;
		if (this.idx < (this.photos.length-1)) {
			this.imageView.mojo.rightUrlProvided(this.photos[this.idx+1].url);
		} else {
			this.imageView.mojo.rightUrlProvided("");
		}
		if (this.idx > 2) {
			var img = new Image();
			img.src = this.photos[this.idx-2].url;
		}
		if (this.idx < (this.photos.length-2)) {
			var img = new Image();
			img.src = this.photos[this.idx+2].url;
		}
//		this.modelCommand.items[0].label = this.photos[this.idx].button;
//		this.controller.modelChanged( this.modelCommand, this );
	} catch (ex) {
		Mojo.Log.error(ex);
	}
};



SpoilerimagesAssistant.prototype.ready = function(event) {
	this.imageView.mojo.manualSize(this.controller.window.innerWidth, this.controller.window.innerHeight);
};








SpoilerimagesAssistant.prototype.handleCommand = function(event) {
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

SpoilerimagesAssistant.prototype.activate = function(event) {
}

SpoilerimagesAssistant.prototype.deactivate = function(event) {
	Mojo.Event.stopListening(this.controller.get('spoilerImages'),Mojo.Event.listTap, this.openImage);
}

SpoilerimagesAssistant.prototype.cleanup = function(event) {

}

