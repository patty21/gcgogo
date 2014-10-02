function SpoilerimagesAssistant(gccode) {
	this.geocode = gccode;
}

SpoilerimagesAssistant.prototype.setup = function() {
	this.photos=cache[this.geocode].spoilerImages;
	this.num=0;
	this.idx=0;
	this.urls=[];
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

	this.appMenuModel = {
		'visible': true,
		'items': [
//			{'label': $L("Reload images"), 'command': 'reloadcache' },
			{'label': $L("Load image from web"), 'command': 'web' },
		]
	};
	this.controller.setupWidget(Mojo.Menu.appMenu, {'omitDefaultItems': true}, this.appMenuModel);


	this.checkImage();

};

SpoilerimagesAssistant.prototype.checkImage = function() {
	var targetdir = ImageDir+this.geocode.substr(0,4)+"/"+this.geocode+"/";
	var targetfile = this.photos[this.num]['url'].substr(this.photos[this.num]['url'].length-40,40);
	Mojo.Log.error("Check_Image:"+this.num+' '+targetdir+targetfile);
	this.purl=targetdir+targetfile;
	var request = new Ajax.Request(targetdir+targetfile, {
        	method: "get",
        	onSuccess: function(r) {
			if (r.status==200) {
				var img= new Image();
				img.src=this.purl;
				if (img.width>0) {
					Mojo.Log.info("Image "+this.num+": local - "+img.width+"x"+img.height);
					this.urls[this.num]=this.photos[this.num]['url'];
					this.photos[this.num]['url']=this.purl;
				} else {
					Mojo.Log.info("Image "+this.num+": screwed - "+img.width+"x"+img.height);
				}
				delete(img);
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
		if (this.photos[this.idx].url.substr(0,ImageDir.length)==ImageDir) {
			this.controller.get("title").innerHTML = "["+(this.idx+1) + "] "+this.photos[this.idx].name;
		} else {
			this.controller.get("title").innerHTML = "("+(this.idx+1) + ") "+this.photos[this.idx].name;
		}
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
			case 'web':
				if (this.urls[this.idx]!=undefined) {
					this.photos[this.idx]['url']=this.urls[this.idx];
				}
				Mojo.Log.info("Reset"+JSON.stringify(this.photos));
				this.updateImages();
			default:
			break;
		}
	}
}

SpoilerimagesAssistant.prototype.activate = function(event) {
}

SpoilerimagesAssistant.prototype.deactivate = function(event) {
}

SpoilerimagesAssistant.prototype.cleanup = function(event) {

}

