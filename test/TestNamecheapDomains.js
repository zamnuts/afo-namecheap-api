var TestBootstrap	= require('./support/TestBootstrap.js'),
	MockData		= require('./support/MockData.js'),
	asyncCheck		= TestBootstrap.asyncCheck,
	expect			= TestBootstrap.expect,
	readXML			= TestBootstrap.readXML,
	testArgs		= TestBootstrap.testArgs,
	noop			= TestBootstrap.noop,
	l				= TestBootstrap.lodash;

describe('NamecheapDomains',function() {
	var NamecheapDomains = require('../lib/NamecheapDomains.js');
	var NamecheapAPI = require('../index.js');

	var nc,ncConfig,regInfo,regMapped;
	beforeEach(function() {
		ncConfig = MockData.ncConfig();
		nc = new NamecheapAPI(ncConfig);
		nc._addRequestToQueue = noop; // so we don't accidentally make any requests over the wire
		regInfo = MockData.regInfo();
		regMapped = MockData.regMapped();
	});

	describe('static',function() {
		it('should have DOMAIN_ACTIVE',function() {
			expect(NamecheapDomains).to.have.property('DOMAIN_ACTIVE')
				.that.is.a('string');
		});

		it('should have DOMAIN_LOCKED',function() {
			expect(NamecheapDomains).to.have.property('DOMAIN_LOCKED')
				.that.is.a('string');
		});

		it('should have DOMAIN_EXPIRED',function() {
			expect(NamecheapDomains).to.have.property('DOMAIN_EXPIRED')
				.that.is.a('string');
		});
	});

	describe('constructor',function() {
		it('should be an instance of NamecheapDomains',function() {
			expect(new NamecheapDomains(nc)).to.be.an.instanceof(NamecheapDomains);
		});

		it('should have a nc property',function() {
			expect(new NamecheapDomains(nc)).to.have.property('nc',nc);
		});

		it('should have dns API access',function() {
			expect(new NamecheapDomains(nc)).to.have.property('dns')
				.that.is.ok();
		});

		it('should have ns API access',function() {
			expect(new NamecheapDomains(nc)).to.have.property('ns')
				.that.is.ok();
		});

		it('should have transfer API access',function() {
			expect(new NamecheapDomains(nc)).to.have.property('transfer')
				.that.is.ok();
		});
	});

	describe('.create',function() {
		it('should attempt to create a domain',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(method).equals('domains.create');
					expect(req).to.eql(l.merge({
						DomainName: 'domain1.com',
						Years: 2,
						PromotionCode: 'promocode',
						AddFreeWhoisguard: 'yes',
						WGEnabled: 'yes'
					},regMapped.zipped));
				});
			}.bind(nc);
			nc.domains.create('domain1.com',2,true,
				regInfo.Registrant,regInfo.Tech,regInfo.Admin,
				regInfo.AuxBilling,regInfo.Billing,'promocode',noop);
		});

		it('should attempt to create a domain without whoisguard',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(method).equals('domains.create');
					expect(req).to.eql(l.merge({
						DomainName: 'domain1.com',
						Years: 2,
						PromotionCode: 'promocode'
					},regMapped.zipped));
				});
			}.bind(nc);
			nc.domains.create('domain1.com',2,false,
				regInfo.Registrant,regInfo.Tech,regInfo.Admin,
				regInfo.AuxBilling,regInfo.Billing,'promocode',noop);
		});

		it('should attempt to create a domain without promo code',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(method).equals('domains.create');
					expect(req).to.eql(l.merge({
						DomainName: 'domain1.com',
						Years: 2,
						AddFreeWhoisguard: 'yes',
						WGEnabled: 'yes'
					},regMapped.zipped));
				});
			}.bind(nc);
			nc.domains.create('domain1.com',2,true,
				regInfo.Registrant,regInfo.Tech,regInfo.Admin,
				regInfo.AuxBilling,regInfo.Billing,noop);
		});

		it('should attempt to create a domain without billing info',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(method).equals('domains.create');
					expect(req).to.eql(l.merge({
						DomainName: 'domain1.com',
						Years: 2,
						AddFreeWhoisguard: 'yes',
						WGEnabled: 'yes'
					},regMapped.zippedNoBill));
				});
			}.bind(nc);
			nc.domains.create('domain1.com',2,true,
				regInfo.Registrant,regInfo.Tech,regInfo.Admin,
				regInfo.AuxBilling,noop);
		});

		it('should attempt to create a domain with empty billing info',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(method).equals('domains.create');
					expect(req).to.eql(l.merge({
						DomainName: 'domain1.com',
						Years: 2,
						AddFreeWhoisguard: 'yes',
						WGEnabled: 'yes'
					},regMapped.zippedNoBill));
				});
			}.bind(nc);
			nc.domains.create('domain1.com',2,true,
				regInfo.Registrant,regInfo.Tech,regInfo.Admin,
				regInfo.AuxBilling,{},noop);
		});

		it('should handle an OK response',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/create-ok'),cb);
			}.bind(nc);
			nc.domains.create('domain1.com',2,false,
				regInfo.Registrant,regInfo.Tech,regInfo.Admin,
				regInfo.AuxBilling,regInfo.Billing,function(err,res) {
					asyncCheck(done,function() {
						expect(res).to.eql({
							domain: 'domain1.com',
							amount: '10.8700',
							domainId: '86374',
							orderId: '719221',
							transactionId: '1075175',
							wg: true,
							realTime: true,
							success: true
						});
					});
				});
		});

		it('should not create a domain with null domain name',function(done) {
			nc.domains.create(
				null,2,false,
				regInfo.reg,regInfo.tech,regInfo.admin,
				regInfo.aux,regInfo.bill,function(err) {
					asyncCheck(done,function() {
						expect(err).to.be.an.instanceof(Error);
					});
				}
			);
		});

		it('should not create a domain with empty domain name',function(done) {
			nc.domains.create(
				'',2,false,
				regInfo.reg,regInfo.tech,regInfo.admin,
				regInfo.aux,regInfo.bill,function(err) {
					asyncCheck(done,function() {
						expect(err).to.be.an.instanceof(Error);
					});
				}
			);
		});

		it('should not create a domain with a whitepsace-only domain name',function(done) {
			nc.domains.create(
				' ',2,false,
				regInfo.reg,regInfo.tech,regInfo.admin,
				regInfo.aux,regInfo.bill,function(err) {
					asyncCheck(done,function() {
						expect(err).to.be.an.instanceof(Error);
					});
				}
			);
		});

		it('should not create a domain with null year',function(done) {
			nc.domains.create(
				'domain1.com',null,false,
				regInfo.reg,regInfo.tech,regInfo.admin,
				regInfo.aux,regInfo.bill,function(err) {
					asyncCheck(done,function() {
						expect(err).to.be.an.instanceof(Error);
					});
				}
			);
		});

		it('should not create a domain with year less than 1',function(done) {
			nc.domains.create(
				'domain1.com',0,false,
				regInfo.reg,regInfo.tech,regInfo.admin,
				regInfo.aux,regInfo.bill,function(err) {
					asyncCheck(done,function() {
						expect(err).to.be.an.instanceof(Error);
					});
				}
			);
		});

		it('should not create a domain with year greater than 10',function(done) {
			nc.domains.create(
				'domain1.com',11,false,
				regInfo.reg,regInfo.tech,regInfo.admin,
				regInfo.aux,regInfo.bill,function(err) {
					asyncCheck(done,function() {
						expect(err).to.be.an.instanceof(Error);
					});
				}
			);
		});

		it('should not create a domain missing registrant info',function(done) {
			nc.domains.create(
				'domain1.com',11,false,
				{},regInfo.tech,regInfo.admin,
				regInfo.aux,regInfo.bill,function(err) {
					asyncCheck(done,function() {
						expect(err).to.be.an.instanceof(Error);
					});
				}
			);
		});

		it('should not create a domain with null tech info',function(done) {
			nc.domains.create(
				'domain1.com',11,false,
				regInfo.reg,null,regInfo.admin,
				regInfo.aux,regInfo.bill,function(err) {
					asyncCheck(done,function() {
						expect(err).to.be.an.instanceof(Error);
					});
				}
			);
		});

		it('should not create a domain with undefined admin info',function(done) {
			nc.domains.create(
				'domain1.com',11,false,
				regInfo.reg,regInfo.tech,undefined,
				regInfo.aux,regInfo.bill,function(err) {
					asyncCheck(done,function() {
						expect(err).to.be.an.instanceof(Error);
					});
				}
			);
		});

		it('should not create a domain with bad aux billing info',function(done) {
			nc.domains.create(
				'domain1.com',11,false,
				regInfo.reg,regInfo.tech,regInfo.admin,
				'bogus',regInfo.bill,function(err) {
					asyncCheck(done,function() {
						expect(err).to.be.an.instanceof(Error);
					});
				}
			);
		});

		// TODO it('should work with additional optional attributes');

	});

	describe('.check',function() {
		it('should use the correct method',function(done) {
			nc._query = function(method) {
				asyncCheck(done,function() {
					expect(method).equals('domains.check');
				});
			}.bind(nc);
			nc.domains.check('domain1.com',noop);
		});

		it('should accept a single domain string',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						DomainList: 'domain1.com'
					});
				});
			}.bind(nc);
			nc.domains.check('domain1.com',noop);
		});

		it('should accept a single domain string (trim)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						DomainList: 'domain1.com'
					});
				});
			}.bind(nc);
			nc.domains.check(' domain1.com ',noop);
		});

		it('should accept a multiple domain string',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						DomainList: 'domain1.com,domain2.com'
					});
				});
			}.bind(nc);
			nc.domains.check('domain1.com,domain2.com',noop);
		});

		it('should accept a multiple domain string (trim)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						DomainList: 'domain1.com,domain2.com'
					});
				});
			}.bind(nc);
			nc.domains.check(' domain1.com , domain2.com ',noop);
		});

		it('should accept a multiple domain string (filter)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						DomainList: 'domain1.com,domain2.com'
					});
				});
			}.bind(nc);
			nc.domains.check(',,domain1.com,,domain2.com,,',noop);
		});

		it('should accept a single domain array',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						DomainList: 'domain1.com'
					});
				});
			}.bind(nc);
			nc.domains.check(['domain1.com'],noop);
		});

		it('should accept a multiple domain array',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						DomainList: 'domain1.com,domain2.com'
					});
				});
			}.bind(nc);
			nc.domains.check(['domain1.com','domain2.com'],noop);
		});

		testArgs([
			{ desc: 'null', value: null },
			{ desc: 'empty', value: '' },
			{ desc: 'whitespace', value: ' ' },
			{ desc: 'empty array', value: [] }
		],[
			{ param: 'domain list', value: 'domain1.com', skip: false }
		],function(argv) {
			nc.domains.check.apply(nc.domains,argv);
		});

		it('should handle single available domain result',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/check-single-available-ok'),cb);
			}.bind(nc);
			nc.domains.check('domain1.com',function(err,list) {
				asyncCheck(done,function() {
					expect(err).to.be.not.ok();
					expect(list).to.eql({
						'domain1.com': true
					});
				});
			});
		});

		it('should handle single unavailable domain result',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/check-single-unavailable-ok'),cb);
			}.bind(nc);
			nc.domains.check('domain1.com',function(err,list) {
				asyncCheck(done,function() {
					expect(err).to.be.not.ok();
					expect(list).to.eql({
						'domain1.com': false
					});
				});
			});
		});

		it('should handle multiple available domain result',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/check-multiple-available-ok'),cb);
			}.bind(nc);
			nc.domains.check(['domain1.com','domain2.com'],function(err,list) {
				asyncCheck(done,function() {
					expect(err).to.be.not.ok();
					expect(list).to.eql({
						'domain1.com': true,
						'domain2.com': true
					});
				});
			});
		});

		it('should handle multiple mixed domain result',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/check-multiple-mixed-ok'),cb);
			}.bind(nc);
			nc.domains.check(['domain1.com','domain2.com'],function(err,list) {
				asyncCheck(done,function() {
					expect(err).to.be.not.ok();
					expect(list).to.eql({
						'domain1.com': true,
						'domain2.com': false
					});
				});
			});
		});
	});

	describe('.getInfo',function() {
		it('should use the correct method',function(done) {
			nc._query = function(method) {
				asyncCheck(done,function() {
					expect(method).equals('domains.getInfo');
				});
			}.bind(nc);
			nc.domains.getInfo('domain1.com',noop);
		});

		testArgs([
			{ desc: 'null', value: null },
			{ desc: 'empty', value: '' },
			{ desc: 'whitespace', value: ' ' },
			{ desc: 'non-string', value: 1 }
		],[
			{ param: 'domain', value: 'domain1.com', skip: false }
		],function(argv) {
			nc.domains.getInfo.apply(nc.domains,argv);
		});

		it('should accept a valid domain',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						DomainName: 'domain1.com'
					});
				});
			}.bind(nc);
			nc.domains.getInfo('domain1.com',noop);
		});

		it('should accept a valid domain (trim)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						DomainName: 'domain1.com'
					});
				});
			}.bind(nc);
			nc.domains.getInfo(' domain1.com ',noop);
		});

		it('should accept a valid domain (lowercase)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						DomainName: 'domain1.com'
					});
				});
			}.bind(nc);
			nc.domains.getInfo('DOMAIN1.COM',noop);
		});

		it('should handle domain info',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/getInfo-ok'),cb);
			}.bind(nc);
			nc.domains.getInfo('domain1.com',function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.not.ok();
					expect(info).to.eql({
						domainId: '86374',
						domain: 'domain1.com',
						status: 'ok',
						createdDate: new Date('10/02/2015 4:00:00 UTC'),
						expiredDate: new Date('10/02/2016 4:00:00 UTC'),
						wg: true,
						wgId: '71147',
						wgExpiredDate: new Date('10/02/2016 4:00:00 UTC'),
						success: true
					});
				});
			});
		});
	});

	describe('.getList',function() {
		it('should use the correct method',function(done) {
			nc._query = function(method) {
				asyncCheck(done,function() {
					expect(method).equals('domains.getList');
				});
			}.bind(nc);
			nc.domains.getList({},noop);
		});

		it('should have default options',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						ListType: NamecheapDomains.LISTTYPE_DEFAULT.toUpperCase(),
						Page: 1,
						PageSize: 20
					});
				});
			}.bind(nc);
			nc.domains.getList({},noop);
		});

		it('should query with null options',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						ListType: NamecheapDomains.LISTTYPE_DEFAULT.toUpperCase(),
						Page: 1,
						PageSize: 20
					});
				});
			}.bind(nc);
			nc.domains.getList(null,noop);
		});

		it('should query with missing options',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						ListType: NamecheapDomains.LISTTYPE_DEFAULT.toUpperCase(),
						Page: 1,
						PageSize: 20
					});
				});
			}.bind(nc);
			nc.domains.getList(noop);
		});

		it('should query with a full set of options',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						ListType: NamecheapDomains.LISTTYPE_EXPIRED.toUpperCase(),
						SearchTerm: 'lorem ipsum',
						Page: 5,
						PageSize: 50,
						SortBy: NamecheapDomains.SORTBY_NAME_DESC.toUpperCase()
					});
				});
			}.bind(nc);
			nc.domains.getList({
				type: NamecheapDomains.LISTTYPE_EXPIRED,
				searchTerm: 'lorem ipsum',
				page: 5,
				pageSize: 50,
				sortBy: NamecheapDomains.SORTBY_NAME_DESC
			},noop);
		});

		it('should query incorrect or out-of-bounds options (upper)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						ListType: NamecheapDomains.LISTTYPE_DEFAULT.toUpperCase(),
						Page: 1000000000,
						PageSize: 100
					});
				});
			}.bind(nc);
			nc.domains.getList({
				type: 'bogusType',
				searchTerm: '',
				page: 5000000000,
				pageSize: 500,
				sortBy: 'bogusSort'
			},noop);
		});

		it('should query incorrect or out-of-bounds options (lower)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						ListType: NamecheapDomains.LISTTYPE_DEFAULT.toUpperCase(),
						Page: 1,
						PageSize: 10
					});
				});
			}.bind(nc);
			nc.domains.getList({
				type: '',
				searchTerm: '  ',
				page: -5,
				pageSize: 5
			},noop);
		});

		it('should handle getting a list of domains',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/getList-ok'),cb);
			}.bind(nc);
			nc.domains.getList(function(err,result) {
				asyncCheck(done,function() {
					expect(err).to.be.not.ok();
					expect(result).to.eql({
						type: NamecheapDomains.LISTTYPE_DEFAULT,
						page: 1,
						pageSize: 20,
						total: 2,
						list: [
							{
								domainId: '86373',
								domain: 'domain1.com',
								username: 'userName',
								created: new Date('2015-10-02T00:00:00.000Z'),
								expires: new Date('2016-10-02T00:00:00.000Z'),
								isExpired: false,
								isLocked: true,
								autoRenew: true,
								wg: true
							},
							{
								domainId: '86374',
								domain: 'domain2.com',
								username: 'userName',
								created: new Date('2015-10-02T00:00:00.000Z'),
								expires: new Date('2017-10-02T00:00:00.000Z'),
								isExpired: true,
								isLocked: false,
								autoRenew: false,
								wg: false
							}
						],
						success: true
					});
				});
			});
		});

		it('should handle getting domain list error',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/getList-error-ok'),cb);
			}.bind(nc);
			nc.domains.getList(function(err,result) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(err.code).to.equal(2013275);
					expect(result).to.be.not.ok();
				});
			});
		});
	});

	describe('.getContacts',function() {
		it('should use the correct method',function(done) {
			nc._query = function(method) {
				asyncCheck(done,function() {
					expect(method).equals('domains.getContacts');
				});
			}.bind(nc);
			nc.domains.getContacts('domain1.com',noop);
		});

		testArgs([
			{ param: 'domain', value: 'domain1.com', skip: false }
		],function(argv) {
			nc.domains.getContacts.apply(nc.domains,argv);
		});

		it('should accept a valid domain',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						DomainName: 'domain1.com'
					});
				});
			}.bind(nc);
			nc.domains.getContacts('domain1.com',noop);
		});

		it('should accept a valid domain (trim)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						DomainName: 'domain1.com'
					});
				});
			}.bind(nc);
			nc.domains.getContacts(' domain1.com ',noop);
		});

		it('should accept a valid domain (lowercase)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						DomainName: 'domain1.com'
					});
				});
			}.bind(nc);
			nc.domains.getContacts('DOMAIN1.COM',noop);
		});

		it('should handle getting domain contacts',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/getContacts-ok'),cb);
			}.bind(nc);
			var contacts = {
				reg: regInfo.Registrant,
				tech: regInfo.Tech,
				admin: regInfo.Admin,
				aux: regInfo.AuxBilling
			};
			contacts.reg.stateProvinceChoice	= 'State';
			contacts.tech.stateProvinceChoice	= 'State';
			contacts.admin.stateProvinceChoice	= 'State';
			contacts.aux.stateProvinceChoice	= 'State';
			nc.domains.getContacts('domain1.com',function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.not.ok();
					expect(info).to.eql({
						domainId: '86374',
						domain: 'domain1.com',
						contacts: contacts,
						success: true
					});
				});
			});
		});

		it('should handle getting domain contacts error',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/getContacts-notfound-ok'),cb);
			}.bind(nc);
			nc.domains.getContacts('domain1.com',function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(err.code).to.equal(2019166);
					expect(info).to.be.not.ok();
				});
			});
		});
	});

	describe('.getTldList',function() {
		it('should not be implemented',function(done) {
			nc.domains.getTldList(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.setContacts',function() {

		var regTree;
		beforeEach(function() {
			regTree = {
				reg: regInfo.Registrant,
				tech: regInfo.Tech,
				admin: regInfo.Admin,
				aux: regInfo.AuxBilling
			};
		});

		it('should use the correct method',function(done) {
			nc._query = function(method) {
				asyncCheck(done,function() {
					expect(method).equals('domains.setContacts');
				});
			}.bind(nc);
			nc.domains.setContacts('domain1.com',regTree,noop);
		});

		testArgs([
			{ param: 'domain', value: 'domain1.com', skip: false },
			{ param: 'regTree', value: {}, skip: false }
		],function(argv) {
			nc.domains.setContacts.apply(nc.domains,argv);
		});

		it('should accept a valid domain',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.contain({
						DomainName: 'domain1.com'
					});
				});
			}.bind(nc);
			nc.domains.setContacts('domain1.com',regTree,noop);
		});

		it('should accept a valid domain (trim)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.contain({
						DomainName: 'domain1.com'
					});
				});
			}.bind(nc);
			nc.domains.setContacts(' domain1.com ',regTree,noop);
		});

		it('should accept a valid domain (lowercase)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.contain({
						DomainName: 'domain1.com'
					});
				});
			}.bind(nc);
			nc.domains.setContacts('DOMAIN1.COM',regTree,noop);
		});

		it('should accept valid contacts info',function(done) {
			var expectValue = l.merge({
				DomainName: 'domain1.com'
			},regMapped.zippedNoBill);
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql(expectValue);
				});
			}.bind(nc);
			nc.domains.setContacts('domain1.com',regTree,noop);
		});

		it('should error on invalid contacts info',function(done) {
			delete regTree.admin;
			nc.domains.setContacts('domain1.com',regTree,function(err,res) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(res).to.not.be.ok();
				});
			});
		});

		it('should error on missing contacts info',function(done) {
			delete regTree.admin.firstName;
			nc.domains.setContacts('domain1.com',regTree,function(err,res) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(res).to.not.be.ok();
				});
			});
		});

		it('should handle setting domain contacts',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/setContacts-ok'),cb);
			}.bind(nc);
			nc.domains.setContacts('domain1.com',regTree,function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.not.ok();
					expect(info).to.eql({
						domain: 'domain1.com',
						success: true
					});
				});
			});
		});
	});

	describe('.reactivate',function() {
		it('should use the correct method',function(done) {
			nc._query = function(method) {
				asyncCheck(done,function() {
					expect(method).equals('domains.reactivate');
				});
			}.bind(nc);
			nc.domains.reactivate('domain1.com',noop);
		});

		testArgs([
			{ param: 'domain', value: 'domain1.com', skip: false }
		],function(argv) {
			nc.domains.reactivate.apply(nc.domains,argv);
		});

		it('should accept a valid domain',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						DomainName: 'domain1.com'
					});
				});
			}.bind(nc);
			nc.domains.reactivate('domain1.com',noop);
		});

		it('should accept a valid domain (trim)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						DomainName: 'domain1.com'
					});
				});
			}.bind(nc);
			nc.domains.reactivate(' domain1.com ',noop);
		});

		it('should accept a valid domain (lowercase)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						DomainName: 'domain1.com'
					});
				});
			}.bind(nc);
			nc.domains.reactivate('DOMAIN1.COM',noop);
		});

		it('should handle domain reactivation',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/reactivate-ok'),cb);
			}.bind(nc);
			nc.domains.reactivate('domain1.com',function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.not.ok();
					expect(info).to.eql({
						domain: 'domain1.com',
						amount: '9.0100',
						orderId: '23569',
						transactionId: '25080',
						success: true
					});
				});
			});
		});

		it('should handle domain reactivation error',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/reactivate-notexpired-ok'),cb);
			}.bind(nc);
			nc.domains.reactivate('domain1.com',function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(err.code).to.equal(2020166);
					expect(info).to.not.be.ok();
				});
			});
		});
	});

	describe('.renew',function() {
		it('should use the correct method',function(done) {
			nc._query = function(method) {
				asyncCheck(done,function() {
					expect(method).equals('domains.renew');
				});
			}.bind(nc);
			nc.domains.renew('domain1.com',1,'code',noop);
		});

		testArgs([
			{ param: 'domain', value: 'domain1.com', skip: false },
			{ param: 'years', value: 1, skip: false },
			{ param: 'promo', value: 'code', skip: true }
		],function(argv) {
			nc.domains.renew.apply(nc.domains,argv);
		});

		it('should accept a valid renewal',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						DomainName: 'domain1.com',
						Years: 1,
						PromotionCode: 'code'
					});
				});
			}.bind(nc);
			nc.domains.renew('domain1.com',1,'code',noop);
		});

		it('should accept a valid renewal (trim)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						DomainName: 'domain1.com',
						Years: 1,
						PromotionCode: 'code'
					});
				});
			}.bind(nc);
			nc.domains.renew(' domain1.com ',' 1 ',' code ',noop);
		});

		it('should accept a valid renewal (no promo)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						DomainName: 'domain1.com',
						Years: 1
					});
				});
			}.bind(nc);
			nc.domains.renew('domain1.com',1,noop);
		});

		it('should accept a valid renewal (lowercase)',function(done) {
			nc._query = function(method,req) {
				asyncCheck(done,function() {
					expect(req).to.eql({
						DomainName: 'domain1.com',
						Years: 1,
						PromotionCode: 'CODE'
					});
				});
			}.bind(nc);
			nc.domains.renew('DOMAIN1.COM',1,'CODE',noop);
		});

		it('should handle renewal',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/renew-ok'),cb);
			}.bind(nc);
			nc.domains.renew('domain1.com',1,'code',function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.not.ok();
					expect(info).to.eql({
						domain: 'domain1.com',
						domainId: '86374',
						amount: '10.8700',
						orderId: '719310',
						transactionId: '1075421',
						years: 0,
						expiredDate: new Date('2017-10-02T12:06:00.000Z'),
						success: true
					});
				});
			});
		});

		it('should handle an invalid renewal',function(done) {
			nc._addRequestToQueue = function(ncr,cb) {
				this._handleResponse(null,readXML('domains/renew-notavailable-ok'),cb);
			}.bind(nc);
			nc.domains.renew('domain1.com',1,'code',function(err,info) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error);
					expect(err.code).to.equal(2019166);
					expect(info).to.not.be.ok();
				});
			});
		});
	});

	describe('.getRegistrarLock',function() {
		it('should not be implemented',function(done) {
			nc.domains.getRegistrarLock(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});

	describe('.setRegistrarLock',function() {
		it('should not be implemented',function(done) {
			nc.domains.setRegistrarLock(function(err) {
				asyncCheck(done,function() {
					expect(err).to.be.an.instanceof(Error)
						.that.has.property('message',NamecheapAPI.ERROR_NOTIMPLEMENTED);
				});
			});
		});
	});
});
