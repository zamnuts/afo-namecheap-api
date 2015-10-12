var TestBootstrap	= require('./support/TestBootstrap.js'),
	MockData		= require('./support/MockData.js'),
	asyncCheck		= TestBootstrap.asyncCheck,
	expect			= TestBootstrap.expect,
	readXML			= TestBootstrap.readXML,
	testArgs		= TestBootstrap.testArgs,
	noop			= TestBootstrap.noop;

describe('NamecheapDomainsNS',function() {
	var NamecheapDomainsNS = require('../lib/NamecheapDomainsNS.js');
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
		it('should be an instance of NamecheapDomainsNS',function() {
			expect(new NamecheapDomainsNS(nc)).to.be.an.instanceof(NamecheapDomainsNS);
		});

		it('should have a nc property',function() {
			expect(new NamecheapDomainsNS(nc)).to.have.property('nc',nc);
		});
	});

	describe('.create',function() {
		it('should use the correct method',function(done) {
			nc._query = function(method) {
				asyncCheck(done,function() {
					expect(method).equals('domains.ns.create');
				});
			}.bind(nc);
			nc.domains.ns.create('domain1','com','ns1.domain1.com','192.168.1.1',noop);
		});

		testArgs([
			{ param: 'sld', value: 'domain1', skip: false },
			{ param: 'tld', value: 'com', skip: false },
			{ param: 'ns', value: 'ns1.domain1.com', skip: false },
			{ param: 'ip', value: '192.168.1.1', skip: false }
		],function(argv) {
			nc.domains.ns.create.apply(nc.domains.ns,argv);
		});

		it('should accept a valid domain with a nameserver and ip pair',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						SLD: 'domain1',
						TLD: 'com',
						Nameserver: 'ns1.domain1.com',
						IP: '192.168.1.1'
					});
				});
			}.bind(nc);
			nc.domains.ns.create('domain1','com','ns1.domain1.com','192.168.1.1',noop);
		});

		it('should accept a valid domain with a nameserver and ip pair (trim)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						SLD: 'domain1',
						TLD: 'com',
						Nameserver: 'ns1.domain1.com',
						IP: '192.168.1.1'
					});
				});
			}.bind(nc);
			nc.domains.ns.create(' domain1 ',' com ',' ns1.domain1.com ',' 192.168.1.1 ',noop);
		});

		it('should handle creating nameservers for a domain',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/ns/create-ok'),cb);
			}.bind(nc);
			nc.domains.ns.create('domain1','com','ns1.domain1.com','192.168.1.1',function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.not.ok();
					expect(info).to.eql({
						sld: 'domain1',
						tld: 'com',
						ns: 'ns1.domain1.com',
						ip: '192.168.1.1',
						fqdn: 'domain1.com',
						success: true
					});
				});
			});
		});

		it('should handle mismatched domain',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/ns/create-ok'),cb);
			}.bind(nc);
			nc.domains.ns.create('domain2','com','ns1.domain1.com','192.168.1.1',function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(info).to.be.not.ok();
				});
			});
		});

		it('should handle mismatched nameserver',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/ns/create-ok'),cb);
			}.bind(nc);
			nc.domains.ns.create('domain1','com','ns1.domain2.com','192.168.1.1',function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(info).to.be.not.ok();
				});
			});
		});

		it('should handle mismatched ip',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/ns/create-ok'),cb);
			}.bind(nc);
			nc.domains.ns.create('domain1','com','ns1.domain1.com','172.16.1.1',function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(info).to.be.not.ok();
				});
			});
		});

		it('should handle failed creation of nameservers',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/ns/create-nosuccess-ok'),cb);
			}.bind(nc);
			nc.domains.ns.create('domain1','com','ns1.domain1.com','192.168.1.1',function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(info).to.be.not.ok();
				});
			});
		});
	});

	describe('.delete',function() {
		it('should use the correct method',function(done) {
			nc._query = function(method) {
				asyncCheck(done,function() {
					expect(method).equals('domains.ns.delete');
				});
			}.bind(nc);
			nc.domains.ns.delete('domain1','com','ns1.domain1.com',noop);
		});

		testArgs([
			{ param: 'sld', value: 'domain1', skip: false },
			{ param: 'tld', value: 'com', skip: false },
			{ param: 'ns', value: 'ns1.domain1.com', skip: false }
		],function(argv) {
			nc.domains.ns.delete.apply(nc.domains.ns,argv);
		});

		it('should accept a valid ns for deletion',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						SLD: 'domain1',
						TLD: 'com',
						Nameserver: 'ns1.domain1.com'
					});
				});
			}.bind(nc);
			nc.domains.ns.delete('domain1','com','ns1.domain1.com',noop);
		});

		it('should accept a valid ns for deletion (trim)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						SLD: 'domain1',
						TLD: 'com',
						Nameserver: 'ns1.domain1.com'
					});
				});
			}.bind(nc);
			nc.domains.ns.delete(' domain1 ',' com ',' ns1.domain1.com ',noop);
		});

		it('should handle deleting the ns',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/ns/delete-ok'),cb);
			}.bind(nc);
			nc.domains.ns.delete('domain1','com','ns1.domain1.com',function(err,result) {
				asyncCheck(done,function() {
					expect(err).to.be.not.ok();
					expect(result).to.eql({
						sld: 'domain1',
						tld: 'com',
						ns: 'ns1.domain1.com',
						fqdn: 'domain1.com',
						success: true
					});
				});
			});
		});

		it('should handle deleting bad ns attempt',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/ns/delete-associated-ok'),cb);
			}.bind(nc);
			nc.domains.ns.delete('domain1','com','ns1.domain1.com',function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(info).to.be.not.ok();
				});
			});
		});

		it('should handle mismatched domain',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/ns/delete-ok'),cb);
			}.bind(nc);
			nc.domains.ns.delete('domain2','com','ns1.domain1.com',function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(info).to.be.not.ok();
				});
			});
		});

		it('should handle mismatched nameserver',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/ns/delete-ok'),cb);
			}.bind(nc);
			nc.domains.ns.delete('domain1','com','ns1.domain2.com',function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(info).to.be.not.ok();
				});
			});
		});
	});

	describe('.getInfo',function() {
		it('should use the correct method',function(done) {
			nc._query = function(method) {
				asyncCheck(done,function() {
					expect(method).equals('domains.ns.getInfo');
				});
			}.bind(nc);
			nc.domains.ns.getInfo('domain1','com','ns1.domain1.com',noop);
		});

		testArgs([
			{ param: 'sld', value: 'domain1', skip: false },
			{ param: 'tld', value: 'com', skip: false },
			{ param: 'ns', value: 'ns1.domain1.com', skip: false }
		],function(argv) {
			nc.domains.ns.getInfo.apply(nc.domains.ns,argv);
		});

		it('should accept a valid sld and tld combo',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						SLD: 'domain1',
						TLD: 'com',
						Nameserver: 'ns1.domain1.com'
					});
				});
			}.bind(nc);
			nc.domains.ns.getInfo('domain1','com','ns1.domain1.com',noop);
		});

		it('should accept a valid sld and tld combo (trim)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						SLD: 'domain1',
						TLD: 'com',
						Nameserver: 'ns1.domain1.com'
					});
				});
			}.bind(nc);
			nc.domains.ns.getInfo(' domain1 ',' com ',' ns1.domain1.com ',noop);
		});

		it('should handle getting ns info',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/ns/getInfo-ok'),cb);
			}.bind(nc);
			nc.domains.ns.getInfo('domain1','com','ns1.domain1.com',function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.not.ok();
					expect(info).to.eql({
						sld: 'domain1',
						tld: 'com',
						ns: 'ns1.domain1.com',
						ip: '192.168.1.1',
						fqdn: 'domain1.com',
						status: ['OK','Linked'],
						success: true
					});
				});
			});
		});

		it('should handle getting missing ns',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/ns/getInfo-notexists-ok'),cb);
			}.bind(nc);
			nc.domains.ns.getInfo('domain1','com','ns1.domain1.com',function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(info).to.be.not.ok();
				});
			});
		});

		it('should handle getting ns info with no status',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/ns/getInfo-nostatus-ok'),cb);
			}.bind(nc);
			nc.domains.ns.getInfo('domain1','com','ns1.domain1.com',function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.not.ok();
					expect(info).to.eql({
						sld: 'domain1',
						tld: 'com',
						ns: 'ns1.domain1.com',
						ip: '192.168.1.1',
						fqdn: 'domain1.com',
						status: [],
						success: true
					});
				});
			});
		});

		it('should handle mismatched domain',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/ns/getInfo-ok'),cb);
			}.bind(nc);
			nc.domains.ns.getInfo('domain2','com','ns1.domain1.com',function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(info).to.be.not.ok();
				});
			});
		});

		it('should handle mismatched nameserver',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/ns/getInfo-ok'),cb);
			}.bind(nc);
			nc.domains.ns.getInfo('domain1','com','ns1.domain2.com',function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(info).to.be.not.ok();
				});
			});
		});
	});

	describe('.update',function() {
		it('should use the correct method',function(done) {
			nc._query = function(method) {
				asyncCheck(done,function() {
					expect(method).equals('domains.ns.update');
				});
			}.bind(nc);
			nc.domains.ns.update('domain1','com','ns1.domain1.com','192.168.1.1','172.16.1.1',noop);
		});

		testArgs([
			{ param: 'sld', value: 'domain1', skip: false },
			{ param: 'tld', value: 'com', skip: false },
			{ param: 'ns', value: 'ns1.domain1.com', skip: false },
			{ param: 'ip', value: '192.168.1.1', skip: false },
			{ param: 'old ip', value: '172.16.1.1', skip: false }
		],function(argv) {
			nc.domains.ns.update.apply(nc.domains.ns,argv);
		});

		it('should accept an updated ip with valid input',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						SLD: 'domain1',
						TLD: 'com',
						Nameserver: 'ns1.domain1.com',
						IP: '192.168.1.1',
						OldIP: '172.16.1.1'
					});
				});
			}.bind(nc);
			nc.domains.ns.update('domain1','com','ns1.domain1.com','192.168.1.1','172.16.1.1',noop);
		});

		it('should accept an updated ip with valid input (trim)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						SLD: 'domain1',
						TLD: 'com',
						Nameserver: 'ns1.domain1.com',
						IP: '192.168.1.1',
						OldIP: '172.16.1.1'
					});
				});
			}.bind(nc);
			nc.domains.ns.update(' domain1 ',' com ',' ns1.domain1.com ',' 192.168.1.1 ',' 172.16.1.1 ',noop);
		});

		it('should handle updating the nameserver ip for a domain',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/ns/update-ok'),cb);
			}.bind(nc);
			nc.domains.ns.update('domain1','com','ns1.domain1.com','192.168.1.1','172.16.1.1',function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.not.ok();
					expect(info).to.eql({
						sld: 'domain1',
						tld: 'com',
						ns: 'ns1.domain1.com',
						ip: '192.168.1.1',
						ipOld: '172.16.1.1',
						fqdn: 'domain1.com',
						success: true
					});
				});
			});
		});

		it('should handle mismatched domain',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/ns/update-ok'),cb);
			}.bind(nc);
			nc.domains.ns.update('domain2','com','ns1.domain1.com','192.168.1.1','172.16.1.1',function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(info).to.be.not.ok();
				});
			});
		});

		it('should handle mismatched nameserver',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/ns/create-ok'),cb);
			}.bind(nc);
			nc.domains.ns.update('domain1','com','ns1.domain2.com','192.168.1.1','172.16.1.1',function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(info).to.be.not.ok();
				});
			});
		});

		it('should handle failed update of nameservers (same ip)',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/ns/update-sameip-ok'),cb);
			}.bind(nc);
			nc.domains.ns.update('domain1','com','ns1.domain1.com','192.168.1.1','192.168.1.1',function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(err.message).to.equal('The original IP and new IP are the same. Please specify a new IP');
					expect(err.code).to.equal(3031510);
					expect(info).to.be.not.ok();
				});
			});
		});
	});
});
