var TestBootstrap	= require('./support/TestBootstrap.js'),
	MockData		= require('./support/MockData.js'),
	asyncCheck		= TestBootstrap.asyncCheck,
	expect			= TestBootstrap.expect,
	noop			= TestBootstrap.noop;

describe('NamecheapUsers',function() {
	var NamecheapUsers = require('../lib/NamecheapUsers.js');
	var NamecheapAPI = require('../index.js');

	var nc,ncConfig,regInfo,regMapped;
	beforeEach(function() {
		ncConfig = MockData.ncConfig();
		nc = new NamecheapAPI(ncConfig);
		nc._addRequestToQueue = noop; // so we don't accidentally make any requests over the wire
		regInfo = MockData.regInfo();
		regMapped = MockData.regMapped();
	});


	describe('constructor',function() {
		it('should be an instance of NamecheapUsers',function() {
			expect(new NamecheapUsers(nc)).to.be.an.instanceof(NamecheapUsers);
		});

		it('should have a nc property',function() {
			expect(new NamecheapUsers(nc)).to.have.property('nc',nc);
		});

		it('should have address API access',function() {
			expect(new NamecheapUsers(nc)).to.have.property('address')
				.that.is.ok();
		});
	});

	describe('.getPricing',function() {
		it('should not be implemented',function(done) {
			nc.users.getPricing(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.getBalances',function() {
		it('should not be implemented',function(done) {
			nc.users.getBalances(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.changePassword',function() {
		it('should not be implemented',function(done) {
			nc.users.changePassword(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.update',function() {
		it('should not be implemented',function(done) {
			nc.users.update(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.createaddfundsrequest',function() {
		it('should not be implemented',function(done) {
			nc.users.createaddfundsrequest(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.getAddFundsStatus',function() {
		it('should not be implemented',function(done) {
			nc.users.getAddFundsStatus(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.login',function() {
		it('should not be implemented',function(done) {
			nc.users.login(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.resetPassword',function() {
		it('should not be implemented',function(done) {
			nc.users.resetPassword(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});
});
