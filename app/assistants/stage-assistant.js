var myStageAssistant = null;
function StageAssistant() {
}

StageAssistant.prototype.setup = function() {
	this.controller.pushScene('first');
	// preCaching database
	
	var dbVersions = [
		{'version': '1.2', 'sql': []},
		{'version': '1.1', 'sql': [
			'ALTER TABLE "trackables" ADD COLUMN "id" TEXT NULL'
		]},
		{'version': '1.0', 'sql': [
			'ALTER TABLE "trackables" ADD COLUMN "id" TEXT NULL',
			'ALTER TABLE "caches" ADD COLUMN "guid" TEXT NULL',
			'ALTER TABLE "caches" ADD COLUMN "userdata" TEXT DEFAULT \'{}\'',
			'CREATE UNIQUE INDEX "guid" on caches (guid ASC)'
		]}
	];
	
	var verIndex = 0, ver;
	do {
		ver = dbVersions[verIndex];
		try {
			Geocaching.db = openDatabase('preCaching', ver['version']);
		} catch(e) {
			if (e.code === e.INVALID_STATE_ERR) {
				verIndex++;
				Mojo.Log.info('Opening database version %d', dbVersions[verIndex]['version']);
			} else {
				Mojo.Log.error('Exception opening db: %s', e.message);
				verIndex = 99;
			}
		}
	} while (!Geocaching.db && verIndex <= dbVersions.length);
	
	// Database migration - require webOS 1.4.0+
	if(verIndex > 0) {
		Mojo.Log.error(Object.toJSON(ver));
		var latestVersion = dbVersions[0]['version'];
		Geocaching.db.changeVersion(ver['version'], latestVersion, 
			function(transaction) {
				var migrationSuccess = function() {
					Mojo.Log.info("Successfully executed migration statement %d", i);
				};
				var migrationFailed = function(transaction, error) {
					Mojo.Log.error("Error executing migration statement %d: %j", i, error);
				};
				
				var sqlLen = ver['sql'].length;
				for (var i=0; i<sqlLen; i++) {
					transaction.executeSql(ver['sql'][i], [], migrationSuccess, migrationFailed);
				}
			}.bind(this),
			function(transaction, error) {
				Mojo.Log.error("Error upgrading db: %j", error);
			},
			function() {
				Mojo.Log.warn("Migration complete! Creating tables.");
				this.createDB();
			}.bind(this)
		);
	} else {
		this.createDB();
	}

	Geocaching.storage = new Mojo.Depot(
		{
			'name': "precaching",
			'version': 1,
			'replace': false
		},
		function() {

			// Load login data from storage
			// Geocaching.com account is mandatory now
			Geocaching.storage.simpleGet('login', function(response) {
				var size = Object.values(response).size();
				if(1 <= size) {
					Geocaching.login['username'] = response.username;
					Geocaching.login['password'] = response.password;
					Geocaching.login['uid'] = response.uid;

					this.controller.swapScene('main');
					Geocaching.accounts['geocaching.com'].doLogin(Geocaching.login['username'], Geocaching.login['password'], function() {
							// Success
							if(typeof(Geocaching.login['uid']) == 'undefined' || Geocaching.login['uid'] == '' ) {
								Geocaching.accounts['geocaching.com'].getUID(
									function(uid) {
										Mojo.Log.info(uid);
										Geocaching.login['uid']	= uid;
										Geocaching.storage.simpleAdd('login', Geocaching.login);
									}
								);
							}
						}.bind(this),
						function(message) {
							Mojo.Controller.getAppController().showBanner({'messageText': 'Geocaching.com: '+message}, '', 'accounts');
						}.bind(this)
					);
				} else { 
					this.controller.swapScene('accounts', true);
				}
			}.bind(this), function () {});
		
			// Twitter account
			Geocaching.storage.simpleGet('logins-twitter', function(response) {
				var size = Object.values(response).size();
				if(1 <= size) {
					Geocaching.logins['twitter'] = response;
				}
			}.bind(this), function () {});

		}.bind(this),
		function() {}
	);
};

StageAssistant.prototype.createDB = function() 
{
	try {
		Geocaching.db.transaction(
			(function (transaction) {
				//transaction.executeSql('DROP TABLE "caches"', []); 
				transaction.executeSql(
					'CREATE TABLE "caches" ('+
					'    "gccode" TEXT NOT NULL UNIQUE,'+
					'    "guid" TEXT NULL UNIQUE,'+
					'    "updated" INTEGER DEFAULT (0),'+
					'    "type" TEXT DEFAULT (\'cache\'),'+
					'    "found" INTEGER DEFAULT (0),'+
					'    "favourite" INTEGER DEFAULT (0),'+
					'    "latitude" REAL DEFAULT (0),'+
					'    "longitude" REAL DEFAULT (0),'+
					'    "json" TEXT DEFAULT (\'{}\'),'+
					'    "userdata" TEXT DEFAULT (\'{}\')'+
					'); GO;', [],
					function(transaction, results) {
						//transaction.executeSql('CREATE UNIQUE INDEX "gccode" on caches (gccode ASC)', []);
					}.bind(this),
					function(transaction, error) {
						// None
					}.bind(this)
				);
			}).bind(this) 
		);

		Geocaching.db.transaction( 
			(function (transaction) {
				// Table with user lists
				// transaction.executeSql('DROP TABLE IF EXISTS "trackables"; GO;', [], function() {console.log('DROPED'); }); 
				transaction.executeSql(
					'CREATE TABLE  "trackables" ('+
					'    "tbcode" TEXT NOT NULL UNIQUE, '+
					'    "guid" TEXT NOT NULL UNIQUE, '+
					'    "id" TEXT NOT NULL UNIQUE, '+
					'    "updated" INTEGER DEFAULT (0), '+
					'    "type" TEXT DEFAULT (\'21\'), '+
					'    "favourite" INTEGER DEFAULT (0), '+
					'    "json" TEXT DEFAULT (\'{}\') '+
					'); GO;', []
				);
			}).bind(this) 
		);
	} catch(e) {
		Mojo.Log.error(Object.toJSON(e));
	}
}