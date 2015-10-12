var TestBootstrap	= require('./support/TestBootstrap.js'),
	MockData		= require('./support/MockData.js'),
	asyncCheck		= TestBootstrap.asyncCheck,
	expect			= TestBootstrap.expect,
	noop			= TestBootstrap.noop;

describe('NamecheapDomainsTransfer',function() {
	var NamecheapDomainsTransfer = require('../lib/NamecheapDomainsTransfer.js');
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
		it('should be an instance of NamecheapDomainsTransfer',function() {
			expect(new NamecheapDomainsTransfer(nc)).to.be.an.instanceof(NamecheapDomainsTransfer);
		});

		it('should have a nc property',function() {
			expect(new NamecheapDomainsTransfer(nc)).to.have.property('nc',nc);
		});
	});

	describe('.create',function() {
		it('should not be implemented',function(done) {
			nc.domains.transfer.create(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.getStatus',function() {
		it('should not be implemented',function(done) {
			nc.domains.transfer.getStatus(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.updateStatus',function() {
		it('should not be implemented',function(done) {
			nc.domains.transfer.updateStatus(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.getList',function() {
		it('should not be implemented',function(done) {
			nc.domains.transfer.getList(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});
});
