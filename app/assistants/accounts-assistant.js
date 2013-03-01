function AccountsAssistant(params) {
	if (this.firstLaunch == undefined) {
		if(params) {
			this.firstLaunch = params;
		} else {
			this.firstLaunch = false;
		}
	}
}

AccountsAssistant.prototype.setup = function() {
	this.maxAccounts = 1;
	this.accounts = new Array();
	this.controller.setupWidget("accounts-list",
		this.attributes = {
			'itemTemplate': 'accounts/list-item',
			'listTemplate': 'accounts/list-container',
			'emptyTemplate': 'accounts/list-empty',
			'swipeToDelete': false
		},
		this.accountsListModel = {
			'listTitle': $L("Accounts"),
			'items': this.accounts
		}
	);
	
	this.controller.setupWidget('addaccount-button',
		{},
		this.modelAddAccountButton = {
			'buttonLabel': $L("Add new account"),
			'buttonClass': 'primary',
			'disabled': (this.maxAccounts<=this.accounts.length)
		}
	);

	this.buildAccountList();

	this.handleAccountsListTap = this.handleAccountsListTap.bindAsEventListener(this);
	Mojo.Event.listen(this.controller.get('accounts-list'),Mojo.Event.listTap, this.handleAccountsListTap);

	this.addAccountClicked = this.addAccountClicked.bind(this);
	Mojo.Event.listen(this.controller.get('addaccount-button'), Mojo.Event.tap, this.addAccountClicked);
};

AccountsAssistant.prototype.activate = function(event) {
	if (event != undefined) {
		this.buildAccountList();
		if(this.firstLaunch && Geocaching.login['username'] != null && Geocaching.login['password'] != null) {
			// Swap to main scene
			this.controller.stageController.swapScene('main');
		}
	}
};

AccountsAssistant.prototype.deactivate = function(event) {
};

AccountsAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('accounts-list'),Mojo.Event.listTap, this.handleAccountsListTap);
};

AccountsAssistant.prototype.buildAccountList = function() {
	this.accounts = new Array();

	if(Geocaching.login['username'] != null && Geocaching.login['password'] != null) {
		this.accounts.push({
			'id': 'geocaching.com',
			'name': 'Geocaching.com',
			'icon': 'icon32x32.png'
		});
	};

	this.accountsListModel['items'] = this.accounts;
	this.controller.modelChanged(this.accountsListModel);

	this.modelAddAccountButton['disabled'] = (this.maxAccounts<=this.accounts.length);
	this.controller.modelChanged(this.modelAddAccountButton);
}

AccountsAssistant.prototype.addAccountClicked = function(event) {
	this.controller.showDialog({
		'template': 'accounts/accounts-new-scene',
		'assistant': new AccountsNewAssistant(
			this
		)
	});
}

AccountsAssistant.prototype.handleAccountsListTap = function(event) {
	if(typeof(event.item['id']) != 'undefined') {
		switch(event.item['id']) {
			case 'geocaching.com':
				this.controller.stageController.pushScene('login');
			break;
		}
	}
};
