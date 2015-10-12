var NamecheapAPI = require('../index.js'),
	crypto = require('crypto'),
	async = require('async');

var nameserverIP = '0.0.0.0'; // nameserver IP address to associate with ns1 and ns2 subdomains
var nc = new NamecheapAPI({
	apiUser: 'apiuser',
	apiKey: 'apikey',
	userName: 'username',
	clientIP: '0.0.0.0', // public IP address that the remote API will see the request originating from
	isSandbox: true,
	rateLimiter: {
		checkInterval: 1000,
		rates: [
			{limit: 30, per: 1000*60}, // per minute
			{limit: 1200, per: 1000*60*60}, // per hour
			{limit: 10000, per: 1000*60*60*24} // per day
			// {limit: 2, per: 1000}, // per second
			// {limit: 3, per: 1000*2}, // per two seconds
			// {limit: 4, per: 1000*16} // per sixteen seconds
		]
	}
});

function randomDomain(tld) {
	if ( typeof tld !== 'string' ) {
		tld = 'com';
	}
	tld = tld.trim().toLowerCase().substr(0,10);
	return crypto
		.createHash('sha256')
		.update(
			Date.now() +
			JSON.stringify(
				process.hrtime()
			),
			'utf8'
		)
		.digest('base64')
		.substr(0,12)
		.replace(/[^a-z0-9]/gi,'a')
		.toLowerCase() +
		'.' +
		tld;
}

var responseSet = {};

var stateChecker = setInterval(function(){
	console.log('ratesperqueue',nc.rateLimit._ratesPerQueue);
},100);

console.log('Starting waterfall...');
async.waterfall([
	function checkSingleDomain(cb) { // quick sample
		console.log('checkSingleDomain','invoked');
		nc.domains.check(['github.com'],function(err,result) {
			responseSet.checkSingleDomain = err||result;
			console.log('checkSingleDomain','complete');
			cb(err,result);
		});
	},
	function checkMultipleDomains(singleResult,cb) { // quick sample
		console.log('checkMultipleDomains','invoked');
		nc.domains.check(['thisdomainisavailable-yes.com','stackoverflow.com'],function(err,result) {
			responseSet.checkMultipleDomains = err||result;
			console.log('checkMultipleDomains','complete');
			cb(err,result);
		});
	},
	function checkRandomDomain(multipleResult,cb) { // step 1
		console.log('checkRandomDomain','invoked');
		var domain = randomDomain();
		nc.domains.check([domain],function(err,result) {
			responseSet.checkRandomDomain = err||result;
			console.log('checkRandomDomain','complete');
			cb(err,domain);
		});
	},
	function createRandomDomain(domain,cb) { // step 2
		console.log('createRandomDomain','invoked');
		var info = {
			firstName: 'Joe',
			lastName: 'Schmoe',
			address1: '123 Sesame St',
			city: 'Tempe',
			stateProvince: 'Arizona',
			postalCode: '85018',
			country: 'US',
			phone: '+1.5551234567',
			emailAddress: 'joe@example.com'
		};
		// NamecheapDomains.create(domain,years,wg,reg,tech,admin,aux[,bill][,promo],callback);
		nc.domains.create(domain,1,true,info,info,info,info,function(err,result) {
			responseSet.createRandomDomain = err||result;
			console.log('createRandomDomain','complete');
			cb(err,domain);
		});
	},
	function getRandomInfo(domain,cb) {
		console.log('getRandomInfo','invoked');
		nc.domains.getInfo(domain,function(err,result) {
			responseSet.getRandomInfo = err||result;
			console.log('getRandomInfo','complete');
			cb(err,domain);
		});
	},
	function createNS1(domain,cb) { // step 3
		console.log('createNS1','invoked');
		var dparts = domain.split('.');
		nc.domains.ns.create(dparts[0],dparts[1],'ns1.'+domain,nameserverIP,function(err,result) {
			responseSet.createNS1 = err||result;
			console.log('createNS1','complete');
			cb(err,domain);
		});
	},
	function createNS2(domain,cb) { // step 4
		console.log('createNS2','invoked');
		var dparts = domain.split('.');
		nc.domains.ns.create(dparts[0],dparts[1],'ns2.'+domain,nameserverIP,function(err,result) {
			responseSet.createNS2 = err||result;
			console.log('createNS2','complete');
			cb(err,domain);
		});
	},
	function setNS(domain,cb) { // step 5
		console.log('setNS','invoked');
		var dparts = domain.split('.');
		nc.domains.dns.setCustom(dparts[0],dparts[1],['ns1.'+domain,'ns2.'+domain],function(err,result) {
			responseSet.setNS = err||result;
			console.log('setNS','complete');
			cb(err,domain);
		});
	}
],function waterfallComplete(err,domain) { // done!
	console.log('waterfallComplete',err,domain,responseSet);
	console.log('ratesperqueue',nc.rateLimit._ratesPerQueue);
	clearInterval(stateChecker);
});
