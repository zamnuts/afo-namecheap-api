var TestBootstrap	= require('./support/TestBootstrap.js'),
	MockData		= require('./support/MockData.js'),
	asyncCheck		= TestBootstrap.asyncCheck,
	expect			= TestBootstrap.expect,
	noop			= TestBootstrap.noop;

describe('NamecheapSSL',function() {
	var NamecheapSSL = require('../lib/NamecheapSSL.js');
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
		it('should be an instance of NamecheapSSL',function() {
			expect(new NamecheapSSL(nc)).to.be.an.instanceof(NamecheapSSL);
		});

		it('should have a nc property',function() {
			expect(new NamecheapSSL(nc)).to.have.property('nc',nc);
		});
	});

	describe('.activate',function() {
		it('should not be implemented',function(done) {
			nc.ssl.activate(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.getInfo',function() {
		it('should not be implemented',function(done) {
			nc.ssl.getInfo(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.parseCSR',function() {
		it('should not be implemented',function(done) {
			nc.ssl.parseCSR(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.getApproverEmailList',function() {
		it('should not be implemented',function(done) {
			nc.ssl.getApproverEmailList(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.getList',function() {
		it('should not be implemented',function(done) {
			nc.ssl.getList(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.create',function() {
		it('should not be implemented',function(done) {
			nc.ssl.create(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.renew',function() {
		it('should not be implemented',function(done) {
			nc.ssl.renew(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.resendApproverEmail',function() {
		it('should not be implemented',function(done) {
			nc.ssl.resendApproverEmail(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.resendfulfillmentemail',function() {
		it('should not be implemented',function(done) {
			nc.ssl.resendfulfillmentemail(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.reissue',function() {
		it('should not be implemented',function(done) {
			nc.ssl.reissue(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});
});
