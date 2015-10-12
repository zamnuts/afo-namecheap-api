var TestBootstrap	= require('./support/TestBootstrap.js'),
	MockData		= require('./support/MockData.js'),
	asyncCheck		= TestBootstrap.asyncCheck,
	expect			= TestBootstrap.expect,
	readXML			= TestBootstrap.readXML,
	noop			= TestBootstrap.noop;

var RateLimit = require('afo-ratelimit');

describe('NamecheapAPI',function() {
	var NamecheapAPI = require('../index.js');

	describe('static',function() {
		it('should have ERROR_UNKNOWN',function() {
			expect(NamecheapAPI).to.have.property('ERROR_UNKNOWN')
				.that.is.a('string');
		});

		it('should have ERROR_NOTIMPLEMENTED',function() {
			expect(NamecheapAPI).to.have.property('ERROR_NOTIMPLEMENTED')
				.that.is.a('string');
		});
	});

	describe('constructor',function() {
		it('should be an instance of NamecheapAPI',function() {
			expect(new NamecheapAPI()).to.be.an.instanceof(NamecheapAPI);
		});

		it('should have default configs',function() {
			var nc = new NamecheapAPI();
			expect(nc).to.have.property('config')
				.that.is.an('object')
				.that.deep.equals({
					apiUser: '',
					apiKey: '',
					userName: '',
					clientIP: '',
					isSandbox: false,
					logContext: console,
					rateLimiter: null,
					endPoints: {
						production: 'https://api.namecheap.com/xml.response',
						sandbox: 'https://api.sandbox.namecheap.com/xml.response'
					}
				});
		});

		it('should allow config overrides',function() {
			var config = {
				apiUser: 'username',
				apiKey: 'somekey',
				isSandbox: true
			};
			var nc = new NamecheapAPI(config);
			expect(nc).to.have.property('config')
				.that.contains(config);
		});
	});

	describe('properties',function() {
		it('should have nc property that is itself',function() {
			var nc = new NamecheapAPI();
			expect(nc).to.have.property('nc')
				.that.equals(nc);
		});

		it('should have an internal rate limiter',function() {
			expect(new NamecheapAPI()).to.have.property('rateLimit')
				.that.is.an.instanceof(RateLimit);
		});

		it('should have a queueId',function() {
			expect(new NamecheapAPI()).to.have.property('queueId')
				.that.is.ok();
		});

		it('should reflect the propert end point type',function() {
			expect(new NamecheapAPI({isSandbox:false})).to.have.property('endPointName')
				.that.equals('production');
			expect(new NamecheapAPI({isSandbox:true})).to.have.property('endPointName')
				.that.equals('sandbox');
		});

		it('should have domains API access',function() {
			expect(new NamecheapAPI()).to.have.property('domains')
				.that.is.ok();
		});

		it('should have domains.dns API access',function() {
			expect(new NamecheapAPI()).to.have.property('domains')
				.that.has.property('dns')
				.that.is.ok();
		});

		it('should have domains.ns API access',function() {
			expect(new NamecheapAPI()).to.have.property('domains')
				.that.has.property('ns')
				.that.is.ok();
		});

		it('should have domains.transfer API access',function() {
			expect(new NamecheapAPI()).to.have.property('domains')
				.that.has.property('transfer')
				.that.is.ok();
		});

		it('should have ssl API access',function() {
			expect(new NamecheapAPI()).to.have.property('ssl')
				.that.is.ok();
		});

		it('should have users API access',function() {
			expect(new NamecheapAPI()).to.have.property('users')
				.that.is.ok();
		});

		it('should have whoisguard API access',function() {
			expect(new NamecheapAPI()).to.have.property('whoisguard')
				.that.is.ok();
		});
	});

	describe('._error',function() {
		var nc,err;
		beforeEach(function() {
			nc = new NamecheapAPI();
			err = new Error('Some Error');
		});

		it('should return undefined and not throw if missing callback',function() {
			expect(nc._error()).to.be.undefined();
		});

		it('should callback with error',function(done) {
			nc._error(err,function(cbError) {
				asyncCheck(done,function() {
					expect(cbError).equals(err);
				});
			});
		});

		it('should callback with error when given string',function(done) {
			nc._error(err.message,function(cbError) {
				asyncCheck(done,function() {
					expect(cbError).to.be.an.instanceof(Error);
					expect(cbError.message).to.equal(err.message);
				});
			});
		});

		it('should callback with unknown error when given empty string',function(done) {
			nc._error('',function(cbError) {
				asyncCheck(done,function() {
					expect(cbError).to.be.an.instanceof(Error);
					expect(cbError.message).to.have.length.above(0);
				});
			});
		});

		it('should callback with unknown erro when given non-string message',function(done) {
			nc._error(undefined,function(cbError) {
				asyncCheck(done,function() {
					expect(cbError).to.be.an.instanceof(Error);
					expect(cbError.message).to.have.length.above(0);
				});
			});
		});

		// TODO it('should log without a callback')
	});

	describe('._notImplemented',function() {
		var nc;
		beforeEach(function() {
			nc = new NamecheapAPI();
		});

		it('should callback with not implemented message given argv',function(done) {
			nc._notImplemented({
				0: function(cbError) {
					asyncCheck(done,function() {
						expect(cbError).to.be.an.instanceof(Error);
						expect(cbError.message).to.contain('not implemented');
					});
				},
				length: 1
			});
		});

		it('should callback with not implemented message given function',function(done) {
			nc._notImplemented(function(cbError) {
				asyncCheck(done,function() {
					expect(cbError).to.be.an.instanceof(Error);
					expect(cbError.message).to.contain('not implemented');
				});
			});
		});

		// TODO it('should still work without a callback')
	});

	describe('._query',function() {
		var NamecheapRequest = require('../lib/NamecheapRequest.js');
		var nc,ncConfig;
		beforeEach(function() {
			ncConfig = MockData.ncConfig();
			nc = new NamecheapAPI(ncConfig);
		});

		it('should handle a generic noop from API call (bogus method)',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('noop'),cb);
			}.bind(nc);
			nc._query('noop',null,null,function(err,res) {
				asyncCheck(done,function() {
					expect(err).to.be.not.ok();
					expect(res).to.be.ok();
					expect(res.$).to.eql({
						Type: 'namecheap.noop'
					});
				});
			});
		});

		it('should handle an erroneous error from API call',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('erroneous'),cb);
			}.bind(nc);
			nc._query('noop',null,null,function(err,res) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(err.message).to.equal('Error message');
					expect(err.code).to.equal(0);
					expect(res).to.be.not.ok();
				});
			});
		});

		it('should handle an general error from API call',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('missing-command'),cb);
			}.bind(nc);
			nc._query('noop',null,null,function(err,res) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(err.message).to.equal('Parameter Command is missing');
					expect(err.code).to.equal(1010104);
					expect(res).to.be.not.ok();
				});
			});
		});

		it('should have the base params with null',function(done) {
			nc._addRequestToQueue = function(ncr) {
				asyncCheck(done,function() {
					expect(ncr).to.be.an.instanceof(NamecheapRequest);
					expect(ncr.parameters).to.eql({
						ApiUser: ncConfig.apiUser,
						ApiKey: ncConfig.apiKey,
						UserName: ncConfig.userName,
						ClientIp: ncConfig.clientIP,
						Command: 'namecheap.noop'
					});
				});
			}.bind(nc);
			nc._query('noop',null,null,noop);
		});

		it('should have the base params with {}',function(done) {
			nc._addRequestToQueue = function(ncr) {
				asyncCheck(done,function() {
					expect(ncr).to.be.an.instanceof(NamecheapRequest);
					expect(ncr.parameters).to.eql({
						ApiUser: ncConfig.apiUser,
						ApiKey: ncConfig.apiKey,
						UserName: ncConfig.userName,
						ClientIp: ncConfig.clientIP,
						Command: 'namecheap.noop'
					});
				});
			}.bind(nc);
			nc._query('noop',{},null,noop);
		});

		it('should prefix with "namecheap." if the command is missing it',function(done) {
			nc._addRequestToQueue = function(ncr) {
				asyncCheck(done,function() {
					expect(ncr.parameters).to.have.property('Command','namecheap.noop');
				});
			}.bind(nc);
			nc._query('noop',null,null,noop);
		});

		it('should not prefix with "namecheap." if the command already specifies it',function(done) {
			nc._addRequestToQueue = function(ncr) {
				asyncCheck(done,function() {
					expect(ncr.parameters).to.have.property('Command','namecheap.noop');
				});
			}.bind(nc);
			nc._query('namecheap.noop',null,null,noop);
		});

		it('should allow for omitting method',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				asyncCheck(done,function() {
					expect(cb).to.eql(noop);
					expect(ncr.method).to.equal(NamecheapRequest.HTTP_DEFAULT);
				});
			}.bind(nc);
			nc._query('noop',null,noop);
		});

		it('should uppercase method',function(done) {
			nc._addRequestToQueue = function(ncr) {
				asyncCheck(done,function() {
					expect(ncr.method).to.equal('GET');
				});
			}.bind(nc);
			nc._query('noop',null,'get',noop);
		});

		it('should default to noop command on null',function(done) {
			nc._addRequestToQueue = function(ncr) {
				asyncCheck(done,function() {
					expect(ncr.parameters).to.have.property('Command','namecheap.noop');
				});
			}.bind(nc);
			nc._query(null,null,null,noop);
		});

		it('should default to noop command on empty',function(done) {
			nc._addRequestToQueue = function(ncr) {
				asyncCheck(done,function() {
					expect(ncr.parameters).to.have.property('Command','namecheap.noop');
				});
			}.bind(nc);
			nc._query('',null,null,noop);
		});
	});
});
