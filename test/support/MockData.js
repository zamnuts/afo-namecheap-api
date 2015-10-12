var l = require('lodash');

var ncConfig,regInfo,regMapped,wgInfo,wgMapped;

(function() {
	ncConfig = {
		apiUser: 'apiuser',
		apiKey: 'apikey',
		userName: 'username',
		clientIP: '192.168.1.1',
		isSandbox: true
	};

	regInfo            = {
		Registrant: {
			firstName: 'Ricky',
			lastName: 'Bobby',
			address1: '123 Sesame St.',
			city: 'New York',
			stateProvince: 'New York',
			postalCode: '10023',
			country: 'US',
			phone: '+1.2125551234',
			emailAddress: 'ricky@example.com'
		}
	};
	regInfo.Tech       = l.cloneDeep(regInfo.Registrant);
	regInfo.Admin      = l.cloneDeep(regInfo.Registrant);
	regInfo.AuxBilling = l.cloneDeep(regInfo.Registrant);
	regInfo.Billing    = l.cloneDeep(regInfo.Registrant);

	wgInfo            = {
		Registrant: {
			organizationName: 'WhoisGuard',
			jobTitle: 'Please contact protect@whoisguard.com for legal issues',
			firstName: 'WhoisGuard',
			lastName: 'Protected',
			address1: '8939 S. Sepulveda Blvd',
			address2: 'Suite 110-708',
			city: 'Westchester',
			stateProvince: 'CA',
			stateProvinceChoice: 'S',
			postalCode: '90045',
			country: 'US',
			phone: '+1.6613102107',
			fax: '+1.6613102107',
			emailAddress: 'bcbc3567ef3f443591a82cad0df33daa.protect@whoisguard.com',
			phoneExt: 'x123'
		}
	};
	wgInfo.Tech       = l.cloneDeep(wgInfo.Registrant);
	wgInfo.Admin      = l.cloneDeep(wgInfo.Registrant);
	wgInfo.AuxBilling = l.cloneDeep(wgInfo.Registrant);
	wgInfo.Billing    = l.cloneDeep(wgInfo.Registrant);

	regMapped        = {
		Registrant: {},
		Tech: {},
		Admin: {},
		AuxBilling: {},
		Billing: {},
		zipped: {}, // all of the above groups in a single object
		zippedNoBill: {} // same as `zipped` but w/o `Billing` /there's a country soul that reads post no bills/
	};
	wgMapped		= l.cloneDeep(regMapped);

	[regMapped,wgMapped].forEach(function(objMapped) {
		var objInfo = objMapped === regMapped ? regInfo : wgInfo;
		l.forOwn(objInfo,function(groupObj,groupKey) {
			if ( !objMapped[groupKey] ) {
				return;
			}
			l.forOwn(groupObj,function(fieldValue,fieldKey) {
				objMapped[groupKey][groupKey + l.capitalize(fieldKey)] = fieldValue;
			});
			l.merge(objMapped.zipped,objMapped[groupKey]);
			if ( groupKey !== 'Billing' ) {
				l.merge(objMapped.zippedNoBill,objMapped[groupKey]);
			}
		});
	});
}());

module.exports.regInfo = function() {
	return l.cloneDeep(regInfo);
};

module.exports.regMapped = function() {
	return l.cloneDeep(regMapped);
};

module.exports.wgInfo = function() {
	return l.cloneDeep(wgInfo);
};

module.exports.wgMapped = function() {
	return l.cloneDeep(wgMapped);
};

module.exports.ncConfig = function() {
	return l.cloneDeep(ncConfig);
};
