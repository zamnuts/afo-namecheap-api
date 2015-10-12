var TestBootstrap	= require('./support/TestBootstrap.js'),
	MockData		= require('./support/MockData.js'),
	expect			= TestBootstrap.expect,
	l				= TestBootstrap.lodash,
	readXML			= TestBootstrap.readXML,
	xml2js			= TestBootstrap.xml2js;

describe('WhoisMapper',function() {
	var WhoisMapper = require('../lib/WhoisMapper.js');

	var regInfo,regMapped,wgInfo,wgMapped,fieldsReqNoBill,fieldsReq,fieldsOptNoBill,fieldsOpt;
	beforeEach(function() {
		regInfo		= MockData.regInfo();
		regMapped	= MockData.regMapped();
		wgInfo		= MockData.wgInfo();
		wgMapped	= MockData.wgMapped();
		fieldsReqNoBill = [
			'RegistrantFirstName','RegistrantLastName','RegistrantAddress1',
			'RegistrantCity','RegistrantStateProvince','RegistrantPostalCode',
			'RegistrantCountry','RegistrantPhone','RegistrantEmailAddress',
			'TechFirstName','TechLastName','TechAddress1',
			'TechCity','TechStateProvince','TechPostalCode',
			'TechCountry','TechPhone','TechEmailAddress',
			'AdminFirstName','AdminLastName','AdminAddress1',
			'AdminCity','AdminStateProvince','AdminPostalCode',
			'AdminCountry','AdminPhone','AdminEmailAddress',
			'AuxBillingFirstName','AuxBillingLastName','AuxBillingAddress1',
			'AuxBillingCity','AuxBillingStateProvince','AuxBillingPostalCode',
			'AuxBillingCountry','AuxBillingPhone','AuxBillingEmailAddress'
		];
		fieldsReq = fieldsReqNoBill.concat([
			'BillingFirstName','BillingLastName','BillingAddress1',
			'BillingCity','BillingStateProvince','BillingPostalCode',
			'BillingCountry','BillingPhone','BillingEmailAddress'
		]);
		fieldsOptNoBill = [
			'RegistrantOrganizationName','RegistrantJobTitle','RegistrantAddress2',
			'RegistrantStateProvinceChoice','RegistrantPhoneExt','RegistrantFax',
			'TechOrganizationName','TechJobTitle','TechAddress2',
			'TechStateProvinceChoice','TechPhoneExt','TechFax',
			'AdminOrganizationName','AdminJobTitle','AdminAddress2',
			'AdminStateProvinceChoice','AdminPhoneExt','AdminFax',
			'AuxBillingOrganizationName','AuxBillingJobTitle','AuxBillingAddress2',
			'AuxBillingStateProvinceChoice','AuxBillingPhoneExt','AuxBillingFax'
		];
		fieldsOpt = fieldsOptNoBill.concat([
			'BillingOrganizationName','BillingJobTitle','BillingAddress2',
			'BillingStateProvinceChoice','BillingPhoneExt','BillingFax'
		]);
		fieldsReqNoBill.sort();
		fieldsReq.sort();
		fieldsOptNoBill.sort();
		fieldsOpt.sort();
	});

	describe('static',function() {
		it('should have FIELDS',function() {
			expect(WhoisMapper).to.have.property('FIELDS')
				.that.is.an('array');
		});

		it('should have GROUPS',function() {
			expect(WhoisMapper).to.have.property('GROUPS')
				.that.is.an('array');
		});

		it('should have KEY_BILL',function() {
			expect(WhoisMapper).to.have.property('KEY_BILL')
				.that.is.an('string');
		});
	});

	describe('#castString',function() {
		[
			{ask:'str',expect:'str'},
			{ask:'',expect:''},
			{ask:0,expect:'0'},
			{ask:-1,expect:'-1'},
			{ask:1,expect:'1'},
			{ask:Number.NaN,expect:''},
			{ask:null,expect:''},
			{ask:undefined,expect:''},
			{ask:{},expect:''},
			{ask:{key:'value'},expect:''}
		].forEach(function(t) {
			var desc = 'should render '+(typeof t.ask)+' to '+(t.expect===''?'(empty string)':t.expect);
			it(desc,function() {
				expect(WhoisMapper.castString(t.ask)).to.equal(t.expect);
			});
		});
	});

	describe('#fromTreeToFlat',function() {
		it('should have the correct return structure',function() {
			var ret = WhoisMapper.fromTreeToFlat(null);
			expect(ret).to.have.property('out')
				.that.is.an('object');
			expect(ret).to.have.property('missingRequired')
				.that.is.an('array');
			expect(ret).to.have.property('missingOptional')
				.that.is.an('array');
		});

		it('should return actual results on bad input',function() {
			var ret = WhoisMapper.fromTreeToFlat(null);
			expect(ret.out).to.be.empty();
			expect(ret.missingRequired).to.not.be.empty();
			expect(ret.missingOptional).to.be.empty();
		});

		it('should return actual results on bad input (w/billing)',function() {
			var ret = WhoisMapper.fromTreeToFlat(null,true);
			expect(ret.out).to.be.empty();
			expect(ret.missingRequired).to.not.be.empty();
			expect(ret.missingOptional).to.not.be.empty();
		});

		it('should be a valid result with no missing fields',function() {
			var tree = {
				reg: wgInfo.Registrant,
				tech: wgInfo.Tech,
				admin: wgInfo.Admin,
				aux: wgInfo.AuxBilling
			};
			var ret = WhoisMapper.fromTreeToFlat(tree,false);
			expect(ret.out).to.eql(wgMapped.zippedNoBill);
			expect(ret.missingRequired).to.be.empty();
			expect(ret.missingOptional).to.be.empty();
		});

		it('should be a valid result with no missing fields (w/billing)',function() {
			var tree = {
				reg: wgInfo.Registrant,
				tech: wgInfo.Tech,
				admin: wgInfo.Admin,
				aux: wgInfo.AuxBilling,
				bill: wgInfo.Billing
			};
			var ret = WhoisMapper.fromTreeToFlat(tree,true);
			expect(ret.out).to.eql(wgMapped.zipped);
			expect(ret.missingRequired).to.be.empty();
			expect(ret.missingOptional).to.be.empty();
		});

		it('should be a valid result with all missing optional fields',function() {
			var tree = {
				reg: regInfo.Registrant,
				tech: regInfo.Tech,
				admin: regInfo.Admin,
				aux: regInfo.AuxBilling
			};
			var ret = WhoisMapper.fromTreeToFlat(tree,false);
			expect(ret.out).to.eql(regMapped.zippedNoBill);
			expect(ret.missingRequired).to.be.empty();
			ret.missingOptional.sort();
			expect(ret.missingOptional).to.eql(fieldsOptNoBill);
		});

		it('should be a valid result with all missing optional fields (w/billing)',function() {
			var tree = {
				reg: regInfo.Registrant,
				tech: regInfo.Tech,
				admin: regInfo.Admin,
				aux: regInfo.AuxBilling,
				bill: regInfo.Billing
			};
			var ret = WhoisMapper.fromTreeToFlat(tree,true);
			expect(ret.out).to.eql(regMapped.zipped);
			expect(ret.missingRequired).to.be.empty();
			ret.missingOptional.sort();
			expect(ret.missingOptional).to.eql(fieldsOpt);
		});

		it('should be a valid result with all missing fields',function() {
			var tree = {
				reg: {},
				tech: {},
				admin: {},
				aux: {}
			};
			var ret = WhoisMapper.fromTreeToFlat(tree,false);
			expect(ret.out).to.be.empty();
			ret.missingRequired.sort();
			expect(ret.missingRequired).to.eql(fieldsReqNoBill);
			ret.missingOptional.sort();
			expect(ret.missingOptional).to.eql(fieldsOptNoBill);
		});

		it('should be a valid result with all missing fields (w/billing)',function() {
			var tree = {
				reg: {},
				tech: {},
				admin: {},
				aux: {},
				bill: {}
			};
			var ret = WhoisMapper.fromTreeToFlat(tree,true);
			expect(ret.out).to.be.empty();
			ret.missingRequired.sort();
			expect(ret.missingRequired).to.eql(fieldsReq);
			ret.missingOptional.sort();
			expect(ret.missingOptional).to.eql(fieldsOpt);
		});

		it('should be be missing admin specific fields',function() {
			var tree = {
				reg: regInfo.Registrant,
				tech: regInfo.Tech,
				admin: {},
				aux: regInfo.AuxBilling
			};
			var ret = WhoisMapper.fromTreeToFlat(tree,false);
			var znb = l.omit(regMapped.zippedNoBill,function(v,k) {
				return k.indexOf('Admin') === 0;
			});
			expect(ret.out).to.eql(znb);
			var freq = fieldsReqNoBill.filter(function(v) {
				return v.indexOf('Admin') === 0;
			});
			freq.sort();
			ret.missingRequired.sort();
			expect(ret.missingRequired).to.eql(freq);
			ret.missingOptional.sort();
			expect(ret.missingOptional).to.eql(fieldsOptNoBill);
		});

		it('should be be missing admin group entirely',function() {
			var tree = {
				reg: regInfo.Registrant,
				tech: regInfo.Tech,
				aux: regInfo.AuxBilling
			};
			var ret = WhoisMapper.fromTreeToFlat(tree,false);
			var znb = l.omit(regMapped.zippedNoBill,function(v,k) {
				return k.indexOf('Admin') === 0;
			});
			expect(ret.out).to.eql(znb);
			ret.missingRequired.sort();
			expect(ret.missingRequired).to.eql(['Admin']);
			var fopt = fieldsOptNoBill.filter(function(v) {
				return v.indexOf('Admin') !== 0;
			});
			fopt.sort();
			ret.missingOptional.sort();
			expect(ret.missingOptional).to.eql(fopt);
		});
	});

	describe('#fromXMLToTree',function() {

		var xmlData,regXML,regTree,regTreeNoBill,wgXML,wgTree,wgTreeNoBill,missingXML,missingAdmin;
		beforeEach(function(done) { // this beforeEach is kinda dirty, don't need ALL of this on EVERY test, but w/e
			var strXML = readXML('whois-mapper/whois-all');
			var xml2jsOpts = {async:false,attrkey:'$',charkey:'_'};
			xml2js.parseString(strXML,xml2jsOpts,function(err,obj){
				xmlData = obj;
				regXML = xmlData.root.RegPartial[0];
				wgXML = xmlData.root.WGFull[0];
				missingXML = xmlData.root.Missing[0];
				missingAdmin = xmlData.root.MissingAdmin[0];
				regTree = {
					reg: regInfo.Registrant,
					tech: regInfo.Tech,
					admin: regInfo.Admin,
					aux: regInfo.AuxBilling,
					bill: regInfo.Billing
				};
				regTreeNoBill = {
					reg: regInfo.Registrant,
					tech: regInfo.Tech,
					admin: regInfo.Admin,
					aux: regInfo.AuxBilling
				};
				wgTree = {
					reg: wgInfo.Registrant,
					tech: wgInfo.Tech,
					admin: wgInfo.Admin,
					aux: wgInfo.AuxBilling,
					bill: wgInfo.Billing
				};
				wgTreeNoBill = {
					reg: wgInfo.Registrant,
					tech: wgInfo.Tech,
					admin: wgInfo.Admin,
					aux: wgInfo.AuxBilling
				};
				done();
			});
		});

		it('should have the correct return structure',function() {
			var ret = WhoisMapper.fromXMLToTree(null);
			expect(ret).to.have.property('out')
				.that.is.an('object');
			expect(ret).to.have.property('missingRequired')
				.that.is.an('array');
			expect(ret).to.have.property('missingOptional')
				.that.is.an('array');
		});

		it('should return actual results on bad input',function() {
			var ret = WhoisMapper.fromXMLToTree(null);
			expect(ret.out).to.be.empty();
			expect(ret.missingRequired).to.not.be.empty();
			expect(ret.missingOptional).to.be.empty();
		});

		it('should return actual results on bad input (w/billing)',function() {
			var ret = WhoisMapper.fromXMLToTree(null,true);
			expect(ret.out).to.be.empty();
			expect(ret.missingRequired).to.not.be.empty();
			expect(ret.missingOptional).to.not.be.empty();
		});

		it('should be a valid result with no missing fields',function() {
			var ret = WhoisMapper.fromXMLToTree(wgXML,false);
			ret.missingOptional.sort();
			expect(ret.out).to.eql(wgTreeNoBill);
			expect(ret.missingRequired).to.be.empty();
			expect(ret.missingOptional).to.be.empty();
		});

		it('should be a valid result with no missing fields (w/billing)',function() {
			var ret = WhoisMapper.fromXMLToTree(wgXML,true);
			ret.missingOptional.sort();
			expect(ret.out).to.eql(wgTree);
			expect(ret.missingRequired).to.be.empty();
			expect(ret.missingOptional).to.be.empty();
		});

		it('should be a valid result with all missing optional fields',function() {
			var ret = WhoisMapper.fromXMLToTree(regXML,false);
			expect(ret.out).to.eql(regTreeNoBill);
			expect(ret.missingRequired).to.be.empty();
			ret.missingOptional.sort();
			expect(ret.missingOptional).to.eql(fieldsOptNoBill);
		});

		it('should be a valid result with all missing optional fields (w/billing)',function() {
			var ret = WhoisMapper.fromXMLToTree(regXML,true);
			expect(ret.out).to.eql(regTree);
			expect(ret.missingRequired).to.be.empty();
			ret.missingOptional.sort();
			expect(ret.missingOptional).to.eql(fieldsOpt);
		});

		it('should be a valid result with all missing fields',function() {
			var tree = {
				reg: {},
				tech: {},
				admin: {},
				aux: {}
			};
			var ret = WhoisMapper.fromXMLToTree(missingXML,false);
			expect(ret.out).to.eql(tree);
			ret.missingRequired.sort();
			expect(ret.missingRequired).to.eql(fieldsReqNoBill);
			ret.missingOptional.sort();
			expect(ret.missingOptional).to.eql(fieldsOptNoBill);
		});

		it('should be a valid result with all missing fields (w/billing)',function() {
			var tree = {
				reg: {},
				tech: {},
				admin: {},
				aux: {},
				bill: {}
			};
			var ret = WhoisMapper.fromXMLToTree(missingXML,true);
			expect(ret.out).to.eql(tree);
			ret.missingRequired.sort();
			expect(ret.missingRequired).to.eql(fieldsReq);
			ret.missingOptional.sort();
			expect(ret.missingOptional).to.eql(fieldsOpt);
		});

		it('should be be missing admin specific fields',function() {
			var tree = {
				reg: regInfo.Registrant,
				tech: regInfo.Tech,
				admin: {},
				aux: regInfo.AuxBilling
			};
			var ret = WhoisMapper.fromXMLToTree(missingAdmin,false);
			expect(ret.out).to.eql(tree);
			var freq = fieldsReqNoBill.filter(function(v) {
				return v.indexOf('Admin') === 0;
			});
			freq.sort();
			ret.missingRequired.sort();
			expect(ret.missingRequired).to.eql(freq);
			ret.missingOptional.sort();
			expect(ret.missingOptional).to.eql(fieldsOptNoBill);
		});
	});

});
