function ImportAssistant(gccode) {
	this.filename = '';
	this.importing = false;
	this.imported = new Array();
	this.importCount = 0;
	this.importFailures = 0;
	this.progress = 0;
}

ImportAssistant.prototype.setup = function() {

	this.controller.setupWidget('cache-list',
		this.attributes = {
			'itemTemplate': 'list/list-item',
			'listTemplate': 'list/list-container',
			'emptyTemplate':'list/list-empty',
			'swipeToDelete': true,
			'autoconfirmDelete': true
		},
		this.cacheListModel = {
			listTitle: $L("Caches"),
			items : []
		}
	);

	this.controller.setupWidget('action-importtype',
		{
			'choices': [
				{'label': $L("Waypoints"), 'value': 'waypoint'},
				{'label': $L("Geocaches"), 'value': 'geocache'}
			],
			'label': $L({'value': "Import as", 'key': 'import_as'}),
			'labelPlacement': Mojo.Widget.labelPlacementLeft
		},
		this.modelImportType = {
			'value': 'waypoint',
			'disabled': false
		}
	);

	this.controller.setupWidget('action-pickfile', {},
		{
			'label': $L("Pick file"),
			'buttonClass': 'primary',
			'disabled': false
		}
	);

	this.controller.setupWidget('action-import',
		{
			 type: Mojo.Widget.activityButton
		},
		this.importButtonModel = {
			'label': $L("Import"),
			'buttonClass': 'affirmative',
			'disabled': false
		}
	);

	this.controller.setupWidget('action-cancel', {},
		{
			'label': $L("Cancel"),
			'buttonClass': 'negative',
			'disabled': false
		}
	);

	this.pickFile = this.pickFile.bind(this);
	Mojo.Event.listen(this.controller.get('action-pickfile'), Mojo.Event.tap, this.pickFile);

	this.listDelete = this.listDelete.bind(this);
	Mojo.Event.listen(this.controller.get('cache-list'),Mojo.Event.listDelete, this.listDelete);

	this.startImport = this.startImport.bind(this);
	Mojo.Event.listen(this.controller.get('action-import'), Mojo.Event.tap, this.startImport);

	this.cancelImport = this.cancelImport.bind(this);
	Mojo.Event.listen(this.controller.get('action-cancel'), Mojo.Event.tap, this.cancelImport);

	if( gcGogo.isTouchpad() ){
		this.controller.setupWidget(Mojo.Menu.commandMenu, {'menuClass': 'no-fade'},
			this.commandMenuModel = {'items': [
				{'label': $L("Back"), 'icon': 'back', 'command': 'goback'}
			]});
	}
};

ImportAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.command) {
		switch(event.command) {
			case 'goback':
				this.controller.stageController.popScene();
			break;
			default:
			break;
		}
	}
};

ImportAssistant.prototype.activate = function(event) {
}

ImportAssistant.prototype.deactivate = function(event) {
}

ImportAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('action-pickfile'), Mojo.Event.tap, this.pickFile);
	Mojo.Event.stopListening(this.controller.get('cache-list'),Mojo.Event.listDelete, this.listDelete);
	Mojo.Event.stopListening(this.controller.get('action-import'), Mojo.Event.tap, this.startImport);
	Mojo.Event.stopListening(this.controller.get('action-cancel'), Mojo.Event.tap, this.cancelImport);
}

ImportAssistant.prototype.showPopup = function(event, title, message, onChoose) {
	if(typeof(onChoose) != 'function') {
		onChoose = function() {}
	}
	this.controller.showAlertDialog({
		'onChoose': onChoose,
		'title': title,
		'message': message,
		'choices':[ {'label':$L("Close"), 'value':'close', 'type':'negative'} ]
	});
}

ImportAssistant.prototype.pickFile = function(event) {
	Mojo.FilePicker.pickFile(
		{
			'actiontype': 'attach',
			'kind': 'file',
//			'extensions': ['gpx','loc','xml'],
			'extensions': ['gpx', 'loc'],
			'onSelect': function(event) {
				if(event.fullPath) {
					this.filename = event.fullPath;
					Geocaching.parseFile(
						this.filename,
						this.generateList.bind(this),
						function(message) {
							this.filename = '';
							this.showPopup(
								null,
								$L("Problem"),
								message,
								function() { }
							);
						}.bind(this)
					);
				}
			}.bind(this)
		},
		this.controller.stageController
	);
}

ImportAssistant.prototype.generateList = function(cacheList) {

	if(this.filename.match(/\.loc$/i)) {
		this.controller.get('action-importtype').show();
	}

	var len = cacheList.length;
	if(len > 0) {
		this.imported = cacheList;
		var items = new Array();
		for(var z=0; z<len; z++) {
			items.push({
				'guid': cacheList[z]['guid'],
				'name': cacheList[z]['name'],
				'gccode': cacheList[z]['geocode'],
				'type': cacheTypesShort[cacheList[z]['type']],
				'attrs': (cacheList[z]['difficulty']
					?'<img src="images/'+cacheSizeImages[cacheList[z]['size']]+'.gif" /> ('+cacheList[z]['difficulty']+'/'+cacheList[z]['terrain']+')'
					:'<img src="http://www.geocaching.com/ImgGen/seek/CacheInfo.ashx?v='+cacheList[z]['gsattr']+'" />'),
				'distance': '',
				'direction': '',
				'disabled': (cacheList[z]['archived']?' gc-archived':(cacheList[z]['disabled']?' gc-disabled':'')),
				'found': (cacheList[z]['found']?' <img src="images/found.png" />':''),
				'own': (cacheList[z]['own']?' <img src="images/star.png" />':''),
				'maintenance': (cacheList[z]['maintenance']?' <img src="images/needsmaint.png" />':''),
				'members': (cacheList[z]['members']?' <img src="images/members_small.gif" />':'')
			});
		}

		this.cacheListModel['items'] = items;
		this.controller.modelChanged(this.cacheListModel);

		this.importButtonModel['label'] = $L("Import #{num} items").interpolate({'num': this.imported.length});
		this.controller.modelChanged(this.importButtonModel);

		this.controller.get('picker').hide();
		this.controller.get('list').show();
	}
}

ImportAssistant.prototype.listDelete = function(event) {
	this.cacheListModel['items'].splice(this.cacheListModel['items'].indexOf(event.item), 1);
	this.imported.splice(this.cacheListModel['items'].indexOf(event.item), 1);

	this.importButtonModel['label'] = $L("Import #{num} items").interpolate({'num': this.imported.length});
	this.controller.modelChanged(this.importButtonModel);

	if(this.imported.length == 0) {
		this.cancelImport(null);
	}
}

ImportAssistant.prototype.importItem = function(item) {
	Geocaching.db.transaction( 
		(function (transaction) {
			var query = 'INSERT INTO "caches"("gccode", "favourite", "found", "updated", "latitude", "longitude", "json", "logs") VALUES ("'+
				escape(item['geocode']) + '", 1, ' + 
				escape(item['found']?1:0) + ', ' + 
				escape(item['updated']) + ', ' +
				escape(item['latitude']) + ', ' +
				escape(item['longitude']) + ', "' +  
				escape(Object.toJSON(item)) + '", "' +
				escape(Object.toJSON(item['logs'])) +'"); GO;';
			transaction.executeSql(query, [], 
				function() {
					this.importCount++;
					this.progressUpdate();
				}.bind(this),
				function(transaction, error) {
					if(error['code'] == 1) {
						transaction.executeSql('UPDATE "caches" SET '+
							'"json"="'+ escape(Object.toJSON(item)) +'", '+
							'"found"='+ escape(item['found']?1:0) +', '+
							'"favourite"=1, '+
							'"updated"="'+ escape(item['updated']) +'", '+
							'"latitude"='+ escape(item['latitude']) +', '+
							'"longitude"='+ escape(item['longitude']) +', '+
							'"logs"="'+ escape(Object.toJSON(item['logs'])) +'" '+
							' WHERE "gccode"="'+ escape(item['geocode']) +'"; GO; ', [],
							function() {
								this.importCount++;
							}.bind(this),
							function(transaction, error) {
								Mojo.Log.info("Failed to update cache " + item['geocode'] + ". Error: " + error.message);
								this.importFailures++;
							}.bind(this)
						);
					} else {
						Mojo.Log.info("Failed to insert cache " + item['geocode'] + ". Error: " + error.message);
						this.importFailures++;
					}
					this.progressUpdate();
				}.bind(this)
			);
		}).bind(this)
	);

}

ImportAssistant.prototype.startImport = function(event) {
	if(this.importing) {
		return false;
	}
	this.importing = true;

	// When importing LOC file, choose import cache type
	var changeItemType = false;
	if(this.filename.match(/\.loc$/i) && this.modelImportType.value == 'geocache') {
		changeItemType = true;
	}

	this.controller.get('action-cancel').hide();
	this.controller.get('cache-list').hide();

	this.importButtonModel['label'] = $L("Importing ...");
	this.controller.modelChanged(this.importButtonModel);

	var len = this.imported.length;
	var _item, query;
	for(var z=0; z<len; z++) {
		_item = this.imported[z];
		if(changeItemType) { // Change waypoint to geocache
			_item['type'] = 'Geocache';
		}
		this.importItem(_item);
	}
}

ImportAssistant.prototype.cancelImport = function(event) {
	this.imported = new Array();
	this.importCount = 0;
	this.importFailures = 0;

	this.controller.get('list').hide();
	this.controller.get('picker').show();

	this.cacheListModel['items'] = [];
	this.controller.modelChanged(this.cacheListModel);
}

ImportAssistant.prototype.progressUpdate = function() {
	this.progress = ((this.importCount+this.importFailures) / this.imported.length);

	if(this.progress >= 1) {
		Mojo.Log.error("Imported " + this.importCount + " caches. Failed: " + this.importFailures);
		this.controller.showAlertDialog({
				'onChoose': function(value) {
					Mojo.Controller.stageController.popScene();
				}.bind(this),
				'title': $L("Import"),
				'message':$L("Import complete."),
				'choices': [{label:$L("Close"), value:'close', type:'primary'} ]
		});
	}
}
