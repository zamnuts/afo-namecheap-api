var TestBootstrap	= require('./support/TestBootstrap.js'),
	asyncCheck		= TestBootstrap.asyncCheck,
	expect			= TestBootstrap.expect,
	noop			= TestBootstrap.noop;

describe('NamecheapRequest',function() {
	var NamecheapRequest = require('../lib/NamecheapRequest.js');

	describe('static',function() {
		it('should have HTTP_DEFAULT',function() {
			expect(NamecheapRequest).to.have.property('HTTP_DEFAULT')
				.that.is.a('string');
		});

		it('should have HTTP_GET',function() {
			expect(NamecheapRequest).to.have.property('HTTP_GET')
				.that.is.a('string');
		});

		it('should have HTTP_POST',function() {
			expect(NamecheapRequest).to.have.property('HTTP_POST')
				.that.is.a('string');
		});
	});

	describe('constructor',function() {
		it('should be an instance of NamecheapRequest',function() {
			expect(new NamecheapRequest()).to.be.an.instanceof(NamecheapRequest);
		});

		it('should have an endpoint property',function() {
			expect(new NamecheapRequest('value')).to.have.property('endpoint','value');
		});

		it('should have a parameters property',function() {
			var p = {
				key: 'value'
			};
			expect(new NamecheapRequest(null,p)).to.have.property('parameters')
				.that.eql(p);
		});

		it('should have a method property (default)',function() {
			expect(new NamecheapRequest()).to.have.property('method',NamecheapRequest.HTTP_DEFAULT);
		});

		it('should have a method property (defined)',function() {
			expect(new NamecheapRequest(null,null,NamecheapRequest.HTTP_POST))
				.to.have.property('method',NamecheapRequest.HTTP_POST);
		});
	});

	/*
	These are just to test `send`.
	To test response parsing, see TestNamcheapResponse.js
	 */
	describe('.send',function() {
		var url = 'http://example.local:80/',
			params = {key:'value'},
			method = NamecheapRequest.HTTP_DEFAULT,
			http = require('http'),
			https = require('https');

		it('should handle manual port spec, GET method, and a basic KVP',function(done) {
			var ncr = new NamecheapRequest(url,params,method);
			ncr._request = function(client,queryString,options,callback) {
				asyncCheck(done,function() {
					expect(client).to.equal(http);
					expect(queryString).to.equal('key=value');
					expect(options).to.eql({
						hostname: 'example.local',
						port: 80,
						method: method,
						path: '/?key=value',
						agent: false
					});
					expect(callback).to.equal(noop);
				});
			};
			ncr.send(noop);
		});

		it('should handle POST method',function(done) {
			var ncr = new NamecheapRequest(url,params,NamecheapRequest.HTTP_POST);
			ncr._request = function(client,queryString,options,callback) {
				asyncCheck(done,function() {
					expect(client).to.equal(http);
					expect(queryString).to.equal('key=value');
					expect(options).to.eql({
						hostname: 'example.local',
						port: 80,
						method: NamecheapRequest.HTTP_POST,
						path: '/',
						agent: false
					});
					expect(callback).to.equal(noop);
				});
			};
			ncr.send(noop);
		});

		it('should imply the port based on protocol (HTTP)',function(done) {
			var ncr = new NamecheapRequest('http://example.local');
			ncr._request = function(client,queryString,options) {
				asyncCheck(done,function() {
					expect(client).to.equal(http);
					expect(options).to.contain({
						port: 80
					});
				});
			};
			ncr.send(noop);
		});

		it('should imply the port based on protocol (HTTPS)',function(done) {
			var ncr = new NamecheapRequest('https://example.local');
			ncr._request = function(client,queryString,options) {
				asyncCheck(done,function() {
					expect(client).to.equal(https);
					expect(options).to.contain({
						port: 443
					});
				});
			};
			ncr.send(noop);
		});

		it('should handle alternate port',function(done) {
			var ncr = new NamecheapRequest('https://example.local:8443');
			ncr._request = function(client,queryString,options) {
				asyncCheck(done,function() {
					expect(client).to.equal(https);
					expect(options).to.contain({
						port: 8443
					});
				});
			};
			ncr.send(noop);
		});

		it('should handle long path (GET)',function(done) {
			var longPath = '/some/path/to/api';
			var ncr = new NamecheapRequest('http://example.local'+longPath,params,NamecheapRequest.HTTP_GET);
			ncr._request = function(client,queryString,options) {
				asyncCheck(done,function() {
					expect(queryString).to.equal('key=value');
					expect(options).to.contain({
						path: longPath + '?key=value'
					});
				});
			};
			ncr.send(noop);
		});

		it('should handle long path (POST)',function(done) {
			var longPath = '/some/path/to/api';
			var ncr = new NamecheapRequest('http://example.local'+longPath,params,NamecheapRequest.HTTP_POST);
			ncr._request = function(client,queryString,options) {
				asyncCheck(done,function() {
					expect(queryString).to.equal('key=value');
					expect(options).to.contain({
						path: longPath
					});
				});
			};
			ncr.send(noop);
		});
	});
});
