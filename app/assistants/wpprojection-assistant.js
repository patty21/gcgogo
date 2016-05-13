function WpprojectionAssistant(geocode,wpts) {
	this.geocode=geocode;
	this.wpts=wpts;
}

WpprojectionAssistant.prototype.setup = function() {
	var wp,z;
	var wpChoices=[{label:'Cache location',value:0}];
	try {
		for(z=0; z<this.wpts.length; z++) {
			wp=this.wpts[z];
			if(typeof(wp['latitude'])!='undefined' && typeof(wp['longitude'])!='undefined') {
				var sel={};
				sel['label']=wp['name'];
				sel['value']=z+1;
				wpChoices.push(sel);
			}
		}
	} catch(e) {}
	this.controller.setupWidget('origin',
		this.attributesOrigin = {
			'choices': wpChoices,
		},
		this.modelActionOrigin = {
			'value': 0,
			'disabled': false
		}
	);
	var unitChoices=[
		{'label':$L('meters'), 'value':0},
		{'label':$L('feet'), 'value':1},
		{'label':$L('yards'), 'value':2},
		{'label':$L('miles'), 'value':3}
	];
	this.controller.setupWidget('unit',
		this.attributesUnit = {
			'choices': unitChoices,
		},
		this.modelActionUnit = {
			'value': (Geocaching.settings['units'] == 'imperial')? 1 : 0,
			'disabled': false
		}
	);
	
	this.controller.setupWidget('wptName',
		this.attributesWptName = {},
		this.modelWptName = {
			'value': '',
			'disabled': false
		}
	);
	this.controller.setupWidget('angle',
		this.attributesAngle = {
			'modifierState': gcGogo.numlock()
		},
		this.modelAngle = {
			'value': '',
			'disabled': false
		}
	);	
	this.controller.setupWidget('distance',
		this.attributesDistance = {
			'modifierState': gcGogo.numlock()
		},
		this.modelDistance = {
			'value': '',
			'disabled': false
		}
	);	
	
	this.controller.setupWidget('submit', {},
		this.modelSubmit = {
			'label': $L("Save"),
			'class': "palm-button primary",
			'disabled': false
		}
	);
	
	this.actionSubmitClicked = this.actionSubmitClicked.bind(this);
	Mojo.Event.listen(this.controller.get('submit'), Mojo.Event.tap, this.actionSubmitClicked);
	
	if( gcGogo.isTouchpad() ){
		this.controller.setupWidget(Mojo.Menu.commandMenu, {'menuClass': 'no-fade'},
			this.commandMenuModel = {'items': [
				{'label': $L("Back"), 'icon': 'back', 'command': 'goback'}
			]});
	}
	
}

WpprojectionAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('submit'), Mojo.Event.tap, this.actionSubmitClicked);
}


WpprojectionAssistant.prototype.showPopup = function(event, title, message) {
	this.modelSubmit.disabled = false;
	this.controller.modelChanged(this.modelSubmit);
	this.controller.get('submit').mojo.deactivate();
	this.controller.showAlertDialog({
		'onChoose': function(value) {},
		'title': title,
		'message': message,
		'choices': [{'label': $L("Close"), 'type': 'primary'}]
	});
}


WpprojectionAssistant.prototype.actionSubmitClicked = function(event) {
	this.modelSubmit.disabled = true;
	this.controller.modelChanged(this.modelSubmit);
	var wpname = this.controller.get('wptName').mojo.getValue();
	var origin = this.modelActionOrigin['value'];
	var angle = this.controller.get('angle').mojo.getValue();
	var dist = this.controller.get('distance').mojo.getValue();
	var unit = this.modelActionUnit['value'];
	var lat,lon;
	if (wpname=='') {
		this.showPopup(event, $L("Problem"), $L("You need to enter a waypoint name."));
		return false;
	}
	if (angle=='' || isNaN(angle)) {
		this.showPopup(event, $L("Problem"), $L("You need to enter a numeric angle."));
		return false;
	}
	if (dist=='' || isNaN(dist)) {
		this.showPopup(event, $L("Problem"), $L("You need to enter a numeric distance."));
		return false;
	}
//	Mojo.Log.error(Object.toJSON(origin));
	if (origin==0) {
		lat = cache[this.geocode]['latitude'];
		lon = cache[this.geocode]['longitude'];
	} else {
		lat=  this.wpts[origin-1]['latitude'];
		lon=  this.wpts[origin-1]['longitude'];	
	}
	var result = Geocaching.simpleProjection(lat,lon,angle,dist,unit);
	result['wpname'] = wpname;
	this.controller.stageController.popScene(result);
}


WpprojectionAssistant.prototype.handleCommand = function(event) {
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
