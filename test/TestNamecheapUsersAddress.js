var TestBootstrap	= require('./support/TestBootstrap.js'),
	MockData		= require('./support/MockData.js'),
	asyncCheck		= TestBootstrap.asyncCheck,
	expect			= TestBootstrap.expect,
	noop			= TestBootstrap.noop;

describe('NamecheapUsersAddress',function() {
	var NamecheapUsersAddress = require('../lib/NamecheapUsersAddress.js');
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
		it('should be an instance of NamecheapUsersAddress',function() {
			expect(new NamecheapUsersAddress(nc)).to.be.an.instanceof(NamecheapUsersAddress);
		});

		it('should have a nc property',function() {
			expect(new NamecheapUsersAddress(nc)).to.have.property('nc',nc);
		});
	});

	describe('.create',function() {
		it('should not be implemented',function(done) {
			nc.users.address.create(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.delete',function() {
		it('should not be implemented',function(done) {
			nc.users.address.delete(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.getInfo',function() {
		it('should not be implemented',function(done) {
			nc.users.address.getInfo(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.getList',function() {
		it('should not be implemented',function(done) {
			nc.users.address.getList(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.setDefault',function() {
		it('should not be implemented',function(done) {
			nc.users.address.setDefault(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.update',function() {
		it('should not be implemented',function(done) {
			nc.users.address.update(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});
});
