var TestBootstrap	= require('./support/TestBootstrap.js'),
	MockData		= require('./support/MockData.js'),
	asyncCheck		= TestBootstrap.asyncCheck,
	expect			= TestBootstrap.expect,
	readXML			= TestBootstrap.readXML,
	testArgs		= TestBootstrap.testArgs,
	noop			= TestBootstrap.noop;

describe('NamecheapDomainsDNS',function() {
	var NamecheapDomainsDNS = require('../lib/NamecheapDomainsDNS.js');
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
		it('should be an instance of NamecheapDomainsDNS',function() {
			expect(new NamecheapDomainsDNS(nc)).to.be.an.instanceof(NamecheapDomainsDNS);
		});

		it('should have a nc property',function() {
			expect(new NamecheapDomainsDNS(nc)).to.have.property('nc',nc);
		});
	});

	describe('.setCustom',function() {
		it('should use the correct method',function(done) {
			nc._query = function(method) {
				asyncCheck(done,function() {
					expect(method).equals('domains.dns.setCustom');
				});
			}.bind(nc);
			nc.domains.dns.setCustom('domain1','com','ns1.domain1.com',noop);
		});

		testArgs([
			{ param: 'sld', value: 'domain1', skip: false },
			{ param: 'tld', value: 'com', skip: false },
			{ param: 'ns', value: 'ns1.domain1.com', skip: false }
		],function(argv) {
			nc.domains.dns.setCustom.apply(nc.domains.dns,argv);
		});

		it('should fail with empty nameservers array',function(done) {
			nc.domains.dns.setCustom('domain1','com',[],function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
				});
			});
		});

		it('should fail with filtered whitespace nameservers array',function(done) {
			nc.domains.dns.setCustom('domain1','com',[' '],function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
				});
			});
		});

		it('should fail with more than 1200 character nameserver list',function(done) {
			var twelveHundo = Array.apply(null,new Array(201)).map(String.prototype.valueOf,'d.com');
			nc.domains.dns.setCustom('domain1','com',twelveHundo,function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
				});
			});
		});

		it('should accept a valid domain with a single nameserver (string)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						SLD: 'domain1',
						TLD: 'com',
						Nameservers: 'ns1.domain1.com'
					});
				});
			}.bind(nc);
			nc.domains.dns.setCustom('domain1','com','ns1.domain1.com',noop);
		});

		it('should accept a valid domain with a single nameserver (array)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						SLD: 'domain1',
						TLD: 'com',
						Nameservers: 'ns1.domain1.com'
					});
				});
			}.bind(nc);
			nc.domains.dns.setCustom('domain1','com',['ns1.domain1.com'],noop);
		});

		it('should accept a valid domain with multiple nameservers (string)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						SLD: 'domain1',
						TLD: 'com',
						Nameservers: 'ns1.domain1.com,ns2.domain1.com'
					});
				});
			}.bind(nc);
			nc.domains.dns.setCustom('domain1','com','ns1.domain1.com,ns2.domain1.com',noop);
		});

		it('should accept a valid domain with multiple nameservers (array)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						SLD: 'domain1',
						TLD: 'com',
						Nameservers: 'ns1.domain1.com,ns2.domain1.com'
					});
				});
			}.bind(nc);
			nc.domains.dns.setCustom('domain1','com',['ns1.domain1.com','ns2.domain1.com'],noop);
		});

		it('should accept a valid domain with ultiple nameservers (trim)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						SLD: 'domain1',
						TLD: 'com',
						Nameservers: 'ns1.domain1.com,ns2.domain1.com'
					});
				});
			}.bind(nc);
			nc.domains.dns.setCustom(' domain1 ',' com ',[' ns1.domain1.com ',' ns2.domain1.com '],noop);
		});

		it('should handle setting nameservers for a domain',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/dns/setCustom-ok'),cb);
			}.bind(nc);
			nc.domains.dns.setCustom('domain1','com',['ns1.domain1.com','ns2.domain1.com'],function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.not.ok();
					expect(info).to.eql({
						sld: 'domain1',
						tld: 'com',
						nsList: ['ns1.domain1.com','ns2.domain1.com'],
						fqdn: 'domain1.com',
						success: true
					});
				});
			});
		});

		it('should handle failed update for setting nameservers',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/dns/setCustom-noupdate-ok'),cb);
			}.bind(nc);
			nc.domains.dns.setCustom('domain1','com',['ns1.domain1.com','ns2.domain1.com'],function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(info).to.be.not.ok();
				});
			});
		});

		it('should handle mismatched domain',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/dns/setCustom-ok'),cb);
			}.bind(nc);
			nc.domains.dns.setCustom('domain2','com',['ns1.domain1.com','ns2.domain1.com'],function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(info).to.be.not.ok();
				});
			});
		});
	});

	describe('.setDefault',function() {
		it('should not be implemented',function(done) {
			nc.domains.dns.setDefault(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.getList',function() {
		it('should use the correct method',function(done) {
			nc._query = function(method) {
				asyncCheck(done,function() {
					expect(method).equals('domains.dns.getList');
				});
			}.bind(nc);
			nc.domains.dns.getList('domain1','com',noop);
		});

		testArgs([
			{ param: 'sld', value: 'domain1', skip: false },
			{ param: 'tld', value: 'com', skip: false }
		],function(argv) {
			nc.domains.dns.getList.apply(nc.domains.dns,argv);
		});

		it('should accept a valid sld and tld combo',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						SLD: 'domain1',
						TLD: 'com'
					});
				});
			}.bind(nc);
			nc.domains.dns.getList('domain1','com',noop);
		});

		it('should accept a valid sld and tld combo (trim)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						SLD: 'domain1',
						TLD: 'com'
					});
				});
			}.bind(nc);
			nc.domains.dns.getList(' domain1 ',' com ',noop);
		});

		it('should handle getting the list (non custom)',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/dns/getList-ok'),cb);
			}.bind(nc);
			nc.domains.dns.getList('domain1','com',function(err,list) {
				asyncCheck(done,function() {
					expect(err).to.be.not.ok();
					expect(list).to.eql({
						sld: 'domain1',
						tld: 'com',
						nsList: [
							'dns1.registrar-servers.com',
							'dns2.registrar-servers.com',
							'dns3.registrar-servers.com',
							'dns4.registrar-servers.com',
							'dns5.registrar-servers.com'
						],
						fqdn: 'domain1.com',
						customDNS: false,
						success: true
					});
				});
			});
		});

		it('should handle getting the list (custom)',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/dns/getList-custom-ok'),cb);
			}.bind(nc);
			nc.domains.dns.getList('domain1','com',function(err,list) {
				asyncCheck(done,function() {
					expect(err).to.be.not.ok();
					expect(list).to.eql({
						sld: 'domain1',
						tld: 'com',
						nsList: ['ns1.domain1.com','ns2.domain1.com'],
						fqdn: 'domain1.com',
						customDNS: true,
						success: true
					});
				});
			});
		});

		it('should handle mismatched domain',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/dns/getList-ok'),cb);
			}.bind(nc);
			nc.domains.dns.getList('domain2','com',function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(info).to.be.not.ok();
				});
			});
		});
	});

	describe('.getHosts',function() {
		it('should not be implemented',function(done) {
			nc.domains.dns.getHosts(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.getEmailForwarding',function() {
		it('should not be implemented',function(done) {
			nc.domains.dns.getEmailForwarding(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.setEmailForwarding',function() {
		it('should not be implemented',function(done) {
			nc.domains.dns.setEmailForwarding(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.setHosts',function() {
		it('should not be implemented',function(done) {
			nc.domains.dns.setHosts(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});
});
