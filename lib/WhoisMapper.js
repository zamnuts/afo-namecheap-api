var WhoisMapper,
	l = require('lodash');

module.exports = WhoisMapper = {};

WhoisMapper.FIELDS = [
	// required
	{ key: 'firstName', maxLength: 255, required: true },
	{ key: 'lastName', maxLength: 255, required: true },
	{ key: 'address1', maxLength: 255, required: true },
	{ key: 'city', maxLength: 50, required: true },
	{ key: 'stateProvince', maxLength: 50, required: true },
	{ key: 'postalCode', maxLength: 50, required: true },
	{ key: 'country', maxLength: 50, required: true },
	{ key: 'phone', maxLength: 50, required: true },
	{ key: 'emailAddress', maxLength: 255, required: true },
	// optional
	{ key: 'organizationName', maxLength: 255, required: false },
	{ key: 'jobTitle', maxLength: 255, required: false },
	{ key: 'address2', maxLength: 255, required: false },
	{ key: 'stateProvinceChoice', maxLength: 50, required: false },
	{ key: 'phoneExt', maxLength: 50, required: false },
	{ key: 'fax', maxLength: 50, required: false }
];

WhoisMapper.GROUPS = [
	{ key: 'reg', prefix: 'Registrant' },
	{ key: 'tech', prefix: 'Tech' },
	{ key: 'admin', prefix: 'Admin' },
	{ key: 'aux', prefix: 'AuxBilling' },
	{ key: 'bill', prefix: 'Billing' }
];

WhoisMapper.KEY_BILL = 'bill';

/**
 * For use with domains.getContacts
 * @param {{}} obj
 * @param {boolean} [withBilling=false]
 * @returns {{missingOptional: Array, missingRequired: Array, out: {}}}
 */
WhoisMapper.fromXMLToTree = function(obj,withBilling) {
	withBilling = !!(withBilling);
	var ret = {
		missingRequired: [],
		missingOptional: [],
		out: {}
	};
	if ( typeof obj !== 'object' || obj === null ) {
		obj = {};
	}
	var group,field,flatKey,value,i,iLen,j,jLen,isBilling,tmpObj,fieldKey;
	for ( i = 0, iLen = WhoisMapper.GROUPS.length; i < iLen; i++ ) { /* groupIterator */
		group = WhoisMapper.GROUPS[i];
		isBilling = group.key === WhoisMapper.KEY_BILL;
		if ( !withBilling && isBilling ) {
			continue; /* groupIterator */
		}
		if ( !obj[group.prefix] || !obj[group.prefix][0] ) {
			pushMissing(ret,group.prefix,!isBilling);
			continue; /* groupIterator */
		}
		tmpObj = obj[group.prefix][0];
		ret.out[group.key] = ret.out[group.key] || {};
		for ( j = 0, jLen = WhoisMapper.FIELDS.length; j < jLen; j++ ) { /* fieldIterator */
			field = WhoisMapper.FIELDS[j];
			fieldKey = l.capitalize(field.key);
			flatKey = group.prefix + l.capitalize(field.key);
			if ( !tmpObj.hasOwnProperty(fieldKey) || !tmpObj[fieldKey].hasOwnProperty('0') ) {
				pushMissing(ret,flatKey,field.required);
				continue; /* fieldIterator */
			}
			value = tmpObj[fieldKey][0];
			value = WhoisMapper.castString(value).trim();
			if ( !value ) {
				pushMissing(ret,flatKey,field.required);
				continue; /* fieldIterator */
			}
			ret.out[group.key][field.key] = value;
		}
	}
	return ret;
};

/**
 * For use with domains.create and domains.setContacts
 * @param {{}} obj
 * @param {boolean} [withBilling=false]
 * @returns {{missingOptional: Array, missingRequired: Array, out: {}}}
 */
WhoisMapper.fromTreeToFlat = function(obj,withBilling) {
	withBilling = !!(withBilling);
	var ret = {
		missingRequired: [],
		missingOptional: [],
		out: {}
	};
	if ( typeof obj !== 'object' || obj === null ) {
		obj = {};
	}
	var group,field,flatKey,value,i,iLen,j,jLen,isBilling,tmpObj,fieldKey;
	for ( i = 0, iLen = WhoisMapper.GROUPS.length; i < iLen; i++ ) { /* groupIterator */
		group = WhoisMapper.GROUPS[i];
		isBilling = group.key === WhoisMapper.KEY_BILL;
		if ( !withBilling && isBilling ) {
			continue; /* groupIterator */
		}
		if ( !obj[group.key] ) {
			pushMissing(ret,group.prefix,!isBilling);
			continue; /* groupIterator */
		}
		tmpObj = obj[group.key];
		for ( j = 0, jLen = WhoisMapper.FIELDS.length; j < jLen; j++ ) { /* fieldIterator */
			field = WhoisMapper.FIELDS[j];
			fieldKey = field.key;
			flatKey = group.prefix + l.capitalize(field.key);
			if ( !tmpObj.hasOwnProperty(fieldKey) ) {
				pushMissing(ret,flatKey,field.required);
				continue; /* fieldIterator */
			}
			value = tmpObj[fieldKey];
			value = WhoisMapper.castString(value).trim().substr(0,field.maxLength);
			if ( !value ) {
				pushMissing(ret,flatKey,field.required);
				continue; /* fieldIterator */
			}
			ret.out[flatKey] = value;
		}
	}
	return ret;
};

/**
 * @param {*} s
 * @returns {string}
 */
WhoisMapper.castString = function(s) {
	if ( typeof s === 'string' ) {
		return s;
	}
	if ( typeof s === 'undefined' ||
		s === null ||
		isNaN(s)
	)  {
		return '';
	}
	return '' + s;
};

function pushMissing(ret,key,required) {
	if ( required ) {
		ret.missingRequired.push(key);
	} else {
		ret.missingOptional.push(key);
	}
}
