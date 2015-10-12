var NamecheapUsers,
	NamecheapUsersAddress = require('./NamecheapUsersAddress.js');

module.exports = NamecheapUsers = function(nc) {
	this.nc = nc;
};

// sub namespaces
Object.defineProperties(NamecheapUsers.prototype,{
	address: {
		get: function() {
			this._address = this._address || new NamecheapUsersAddress(this.nc);
			return this._address;
		}
	}
});

// methods for this namespace
NamecheapUsers.prototype.getPricing = function() {
	this.nc._notImplemented(arguments);
};

NamecheapUsers.prototype.getBalances = function() {
	this.nc._notImplemented(arguments);
};

NamecheapUsers.prototype.changePassword = function() {
	this.nc._notImplemented(arguments);
};

NamecheapUsers.prototype.update = function() {
	this.nc._notImplemented(arguments);
};

NamecheapUsers.prototype.createaddfundsrequest = function() {
	this.nc._notImplemented(arguments);
};

NamecheapUsers.prototype.getAddFundsStatus = function() {
	this.nc._notImplemented(arguments);
};

NamecheapUsers.prototype.login = function() {
	this.nc._notImplemented(arguments);
};

NamecheapUsers.prototype.resetPassword = function() {
	this.nc._notImplemented(arguments);
};
