var TestBootstrap	= require('./support/TestBootstrap.js'),
	asyncCheck		= TestBootstrap.asyncCheck,
	expect			= TestBootstrap.expect,
	readXML			= TestBootstrap.readXML,
	noop			= TestBootstrap.noop;

describe('NamecheapResponse',function() {
	var NamecheapResponse = require('../lib/NamecheapResponse.js');

	describe('constructor',function() {
		it('should be an instance of NamecheapResponse',function() {
			expect(new NamecheapResponse()).to.be.an.instanceof(NamecheapResponse);
		});

		it('should have an err property',function() {
			expect(new NamecheapResponse()).to.have.property('err',null);
		});

		it('should have a res property',function() {
			expect(new NamecheapResponse()).to.have.property('res',null);
		});

		it('should have a callback property (defaults to noop)',function() {
			var ncr = new NamecheapResponse();
			expect(ncr).to.have.property('callback');
			expect(ncr).to.respondTo('callback');
		});

		it('should set the err property',function() {
			var err = new Error('test error');
			expect(new NamecheapResponse(err)).to.have.property('err',err);
		});

		it('should set the res property',function() {
			var res = 'test body';
			expect(new NamecheapResponse(null,res)).to.have.property('res',res);
		});

		it('should set the callback property',function() {
			var cb = function(){};
			expect(new NamecheapResponse(null,null,cb)).to.have.property('callback',cb);
		});
	});

	describe('.prepare',function() {

		it('should override the callback',function(done) {
			var actualCB,ncr;
			actualCB = function() {
				asyncCheck(done,function() {
					expect(ncr.callback).to.equal(actualCB);
				});
			};
			ncr = new NamecheapResponse(null,'',noop);
			expect(ncr.callback).to.equal(noop);
			ncr.prepare(actualCB);
		});

		it('should callback immediately with err when supplied',function(done) {
			var testErr = new Error('test error');
			new NamecheapResponse(testErr).prepare(function(err) {
				asyncCheck(done,function() {
					expect(err).to.equal(testErr);
				});
			});
		});

		it('should handle a null response body',function(done) {
			new NamecheapResponse(null,null).prepare(function(err,res) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(res).to.be.not.ok();
				});
			});
		});

		it('should handle an empty response body',function(done) {
			new NamecheapResponse(null,'').prepare(function(err,res) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(res).to.be.not.ok();
				});
			});
		});

		// TODO this is throwing in the afo version, why?
		it.skip('should handle a malformed response body',function(done) {
			new NamecheapResponse(null,readXML('malformed')).prepare(function(err,res) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(res).to.be.not.ok();
				});
			});
		});

		it('should handle a bad root in response body',function(done) {
			new NamecheapResponse(null,readXML('bad-root')).prepare(function(err,res) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(res).to.be.not.ok();
				});
			});
		});

		it('should handle a missing XML declaration in response body',function(done) {
			new NamecheapResponse(null,readXML('missing-xml')).prepare(function(err,res) {
				asyncCheck(done,function() {
					expect(err).to.be.not.ok();
					expect(res).to.be.ok();
				});
			});
		});

		it('should provide server details',function(done) {
			new NamecheapResponse(null,readXML('noop')).prepare(function(err,res,details) {
				asyncCheck(done,function() {
					expect(details).to.be.ok();
					expect(details).to.eql({
						serverName: 'SERVER-NAME',
						gmtOffset: 'GMT+5',
						executionTime: 32.76
					});
				});
			});
		});

		it('should provide server details (alt TZ)',function(done) {
			new NamecheapResponse(null,readXML('noop-prod-gmt')).prepare(function(err,res,details) {
				asyncCheck(done,function() {
					expect(details).to.be.ok();
					expect(details).to.eql({
						serverName: 'SERVER-NAME',
						gmtOffset: 'GMT-400',
						executionTime: 32.76
					});
				});
			});
		});
	});
});
