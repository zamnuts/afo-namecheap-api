var TestBootstrap	= require('./support/TestBootstrap.js'),
	MockData		= require('./support/MockData.js'),
	asyncCheck		= TestBootstrap.asyncCheck,
	expect			= TestBootstrap.expect,
	noop			= TestBootstrap.noop;

describe('NamecheapWhoisGuard',function() {
	var NamecheapWhoisGuard = require('../lib/NamecheapWhoisGuard.js');
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
		it('should be an instance of NamecheapWhoisGuard',function() {
			expect(new NamecheapWhoisGuard(nc)).to.be.an.instanceof(NamecheapWhoisGuard);
		});

		it('should have a nc property',function() {
			expect(new NamecheapWhoisGuard(nc)).to.have.property('nc',nc);
		});
	});

	describe('.changeemailaddress',function() {
		it('should not be implemented',function(done) {
			nc.whoisguard.changeemailaddress(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.enable',function() {
		it('should not be implemented',function(done) {
			nc.whoisguard.enable(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.disable',function() {
		it('should not be implemented',function(done) {
			nc.whoisguard.disable(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.unallot',function() {
		it('should not be implemented',function(done) {
			nc.whoisguard.unallot(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.discard',function() {
		it('should not be implemented',function(done) {
			nc.whoisguard.discard(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.allot',function() {
		it('should not be implemented',function(done) {
			nc.whoisguard.allot(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});
});
