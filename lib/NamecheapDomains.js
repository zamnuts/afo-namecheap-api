var NamecheapDomains,
	NamecheapDomainsDNS			= require('./NamecheapDomainsDNS.js'),
	NamecheapDomainsNS			= require('./NamecheapDomainsNS.js'),
	NamecheapDomainsTransfer	= require('./NamecheapDomainsTransfer.js'),
	WhoisMapper					= require('./WhoisMapper.js'),
	l							= require('lodash');

module.exports = NamecheapDomains = function(nc) {
	this.nc = nc;
};

// sub namespaces
Object.defineProperties(NamecheapDomains.prototype,{
	dns: {
		get: function() {
			this._dns = this._dns || new NamecheapDomainsDNS(this.nc);
			return this._dns;
		}
	},
	ns: {
		get: function() {
			this._ns = this._ns || new NamecheapDomainsNS(this.nc);
			return this._ns;
		}
	},
	transfer: {
		get: function() {
			this._transfer = this._transfer || new NamecheapDomainsTransfer(this.nc);
			return this._transfer;
		}
	}
});

NamecheapDomains.DOMAIN_ACTIVE			= 'ok';
NamecheapDomains.DOMAIN_LOCKED			= 'locked';
NamecheapDomains.DOMAIN_EXPIRED			= 'expired';

NamecheapDomains.LISTTYPE_DEFAULT		= 'all';
NamecheapDomains.LISTTYPE_ALL			= 'all';
NamecheapDomains.LISTTYPE_EXPIRING		= 'expiring';
NamecheapDomains.LISTTYPE_EXPIRED		= 'expired';

NamecheapDomains.SORTBY_NAME			= 'name';
NamecheapDomains.SORTBY_NAME_DESC		= 'name_desc';
NamecheapDomains.SORTBY_EXPIREDATE		= 'expiredate';
NamecheapDomains.SORTBY_EXPIREDATE_DESC	= 'expiredate_desc';
NamecheapDomains.SORTBY_CREATEDATE		= 'createdate';
NamecheapDomains.SORTBY_CREATEDATE_DESC	= 'createdate_desc';

// methods for this namespace

/**
 * @callback getListCallback
 * @param {Error} err
 * @param {{}} result
 * @param {string} result.type,
 * @param {int} result.page
 * @param {int} result.pageSize
 * @param {int} result.total
 * @param {Object[]} result.list
 * @param {boolean} result.success
 */

/**
 * @param {{}} [options]
 * @param {string} [options.type=NamecheapDomains.LISTTYPE_DEFAULT]
 * @param {string} [options.searchTerm]
 * @param {int} [options.page=1]
 * @param {int} [options.pageSize=20]
 * @param {string} [options.sortBy]
 * @param {getListCallback} callback
 */
NamecheapDomains.prototype.getList = function(options,callback) {
	var args = Array.prototype.slice.call(arguments,0);
	callback = args.pop();
	options = args.shift();
	if ( typeof options !== 'object' || options === null ) {
		options = {};
	}
	var method = 'domains.getList',
		type = options.type,
		searchTerm = options.searchTerm,
		page = options.page,
		pageSize = options.pageSize,
		sortBy = options.sortBy;
	if ( typeof type !== 'string' ) {
		type = NamecheapDomains.LISTTYPE_DEFAULT;
	}
	type = type.trim().toLowerCase();
	if ( !NamecheapDomains.hasOwnProperty('LISTTYPE_'+type.toUpperCase()) ) {
		type = NamecheapDomains.LISTTYPE_DEFAULT;
	}
	if ( typeof searchTerm !== 'string' ) {
		searchTerm = '';
	}
	searchTerm = searchTerm.trim().substr(0,70);
	page = Math.round(parseInt(page)) || 1;
	page = Math.min(Math.max(page,1),1000000000);
	pageSize = Math.round(parseInt(pageSize)) || 20;
	pageSize = Math.min(Math.max(pageSize,10),100);
	if ( typeof sortBy !== 'string' ) {
		sortBy = '';
	}
	sortBy = sortBy.trim().toLowerCase();
	if ( !NamecheapDomains.hasOwnProperty('SORTBY_'+sortBy.toUpperCase()) ) {
		sortBy = '';
	}
	var requestObject = {
		ListType: type.toUpperCase(),
		Page: page,
		PageSize: pageSize
	};
	if ( searchTerm ) {
		requestObject.SearchTerm = searchTerm;
	}
	if ( sortBy ) {
		requestObject.SortBy = sortBy.toUpperCase();
	}
	this.nc._query(method,requestObject,function(err,res) {
		if ( err ) {
			this.nc._error(err,callback);
			return;
		}
		if ( typeof res.DomainGetListResult !== 'object' ) {
			this.nc._error(method+': no domain list result',callback);
			return;
		}
		var domains = res.DomainGetListResult[0] && res.DomainGetListResult[0].Domain,
			paging = res.Paging;
		if ( !l.isArray(domains) ) {
			domains = [];
		}
		var resultObject = {
			type: type,
			page: parseInt(paging && paging[0] && paging[0].CurrentPage && paging[0].CurrentPage[0]),
			pageSize:  parseInt(paging && paging[0] && paging[0].PageSize && paging[0].PageSize[0]),
			total: parseInt(paging && paging[0] && paging[0].TotalItems && paging[0].TotalItems[0]),
			list: [],
			success: true
		};
		if ( searchTerm ) {
			resultObject.searchTerm = searchTerm;
		}
		if ( sortBy ) {
			resultObject.sortBy = sortBy;
		}
		domains.forEach(function(domain) {
			if ( !domain || !domain.$ ) {
				return;
			}
			resultObject.list.push({
				domainId: domain.$.ID || '',
				domain: domain.$.Name || '',
				username: domain.$.User || '',
				created: new Date(domain.$.Created+' 00:00:00 UTC'),
				expires: new Date(domain.$.Expires+' 00:00:00 UTC'),
				isExpired: typeof domain.$.IsExpired === 'string' && domain.$.IsExpired.toLowerCase() === 'true',
				isLocked: typeof domain.$.IsLocked === 'string' && domain.$.IsLocked.toLowerCase() === 'true',
				autoRenew: typeof domain.$.AutoRenew === 'string' && domain.$.AutoRenew.toLowerCase() === 'true',
				wg: typeof domain.$.WhoisGuard === 'string' && domain.$.WhoisGuard.toLowerCase() === 'enabled'
			});
		});
		callback(null,resultObject);
	}.bind(this));
};

NamecheapDomains.prototype.getContacts = function(domain,callback) {
	var method = 'domains.getContacts';
	if ( typeof domain !== 'string' ) {
		this.nc._error(method+': missing one or more required string parameters - domain',callback);
		return;
	}
	domain = domain.trim().toLowerCase().substr(0,70);
	if ( !domain ) {
		this.nc._error(method+': missing one or more required parameters (empty) - domain',callback);
		return;
	}
	this.nc._query(method,{
		DomainName: domain
	},function getContactsCallback(err,res) {
		if ( err ) {
			this.nc._error(err,callback);
			return;
		}
		if ( typeof res.DomainContactsResult !== 'object' ||
			typeof res.DomainContactsResult[0] !== 'object' ||
			typeof res.DomainContactsResult[0].$ !== 'object' ) {
			this.nc._error(method+': no domain contacts result',callback);
			return;
		}
		var sub = res.DomainContactsResult[0].$;
		if ( typeof sub.Domain !== 'string' ) {
			this.nc._error(method+': only got a partial contacts result, cannot validate',callback);
			return;
		}
		if ( sub.Domain.toLowerCase() !== domain.toLowerCase() ) {
			this.nc._error(method+': invalid contacts domain response, expected "'+domain+'" got "'+sub.Domain+'"',callback);
			return;
		}
		var contacts = WhoisMapper.fromXMLToTree(res.DomainContactsResult[0]);
		callback(null,{
			domain: domain,
			domainId: sub.domainnameid || '',
			contacts: contacts.out,
			success: true
		});
	}.bind(this));
};

// TODO: add support for IDN and extended attributes
/**
 * NamecheapDomains.create(domain,years,wg,reg,tech,admin,aux[,bill][,promo],callback);
 */
NamecheapDomains.prototype.create = function() {
	var domain,years,wg,promo,callback,
		info = {reg:null,tech:null,admin:null,aux:null,bill:null},
		method = 'domains.create',
		requestObj = {};
	Array.prototype.slice.call(arguments,0).forEach(function argvIterator(v,i) {
		if ( i === 0 ) {
			domain = v;
		} else if ( i === 1 ) {
			years = v;
		} else if ( i === 2 ) {
			wg = v;
		} else if ( i === 3 ) {
			info.reg = v;
		} else if ( i === 4 ) {
			info.tech = v;
		} else if ( i === 5 ) {
			info.admin = v;
		} else if ( i === 6 ) {
			info.aux = v;
		} else if ( i === 7 ){
			if ( typeof v === 'function' ) {
				callback = v;
			} else if ( typeof v === 'string' ) {
				promo = v;
			} else {
				info.bill = v;
			}
		} else if ( i === 8 ){
			if ( typeof v === 'function' ) {
				callback = v;
			} else if ( typeof v === 'string' ) {
				promo = v;
			}
		} else {
			callback = v;
		}
	});

	if ( typeof callback !== 'function' ) {
		callback = function callbackNoop(){};
	}

	if ( typeof domain !== 'string' ||
			typeof years !== 'number' ||
			typeof wg !== 'boolean' ||
			typeof info.reg !== 'object' ||
			typeof info.tech !== 'object' ||
			typeof info.admin !== 'object' ||
			typeof info.aux !== 'object' ) {
		this.nc._error(method+': missing or invalid datatype for one or more required parameters - domain, years, wg, reg, tech, admin, aux',callback);
		return;
	}
	
	domain = domain.trim().toLowerCase().substr(0,70);
	if ( !domain ) {
		this.nc._error(method+': missing domain',callback);
		return;
	}
	requestObj.DomainName = domain;
	
	if ( years < 1 || years > 10 ) {
		this.nc._error(method+': years must be between 1 and 10 (inclusive)',callback);
		return;
	}
	requestObj.Years = years;
	
	if ( typeof promo !== 'string' ) {
		promo = '';
	}
	promo = promo.trim().substr(0,20);
	if ( promo ) {
		requestObj.PromotionCode = promo;
	}
	var mappedInfo = WhoisMapper.fromTreeToFlat(info,!l.isEmpty(info.bill));
	requestObj = l.merge(requestObj,mappedInfo.out);
	if ( mappedInfo.missingRequired.length ) {
		this.nc._error(method+': one or more missing or invalid properties - reg, tech, admin, aux',callback);
		return;
	}
	if ( wg ) {
		requestObj.AddFreeWhoisguard = 'yes';
		requestObj.WGEnabled = 'yes';
	}
	this.nc._query(method,requestObj,function createCallback(err,res) {
		if ( err ) {
			this.nc._error(err,callback);
			return;
		}
		if ( typeof res.DomainCreateResult !== 'object' ||
				typeof res.DomainCreateResult[0] !== 'object' ||
				typeof res.DomainCreateResult[0].$ !== 'object' ) {
			this.nc._error(method+': no domain create result',callback);
			return;
		}
		var sub = res.DomainCreateResult[0].$;
		if ( typeof sub.Domain === 'undefined' ||
				typeof sub.Registered === 'undefined' ||
				typeof sub.ChargedAmount === 'undefined' ||
				typeof sub.DomainID === 'undefined' ||
				typeof sub.OrderID === 'undefined' ||
				typeof sub.TransactionID === 'undefined' ||
				typeof sub.WhoisguardEnable === 'undefined' ||
				typeof sub.NonRealTimeDomain === 'undefined' ) {
			this.nc._error(method+': only got a partial domain create result, cannot validate',callback);
			return;
		}
		if ( sub.Domain.toLowerCase() !== domain.toLowerCase() ) {
			this.nc._error(method+': invalid domain create response, expected "'+domain+'" got "'+sub.Domain+'"',callback);
			return;
		}
		if ( sub.Registered.toLowerCase() !== 'true' ) {
			this.nc._error(method+': API said "'+domain+'" was not registered',callback);
			return;
		}
		callback(null,{
			domain: sub.Domain,
			amount: sub.ChargedAmount,
			domainId: sub.DomainID,
			orderId: sub.OrderID,
			transactionId: sub.TransactionID,
			wg: sub.WhoisguardEnable.toLowerCase() === 'true',
			realTime: sub.NonRealTimeDomain.toLowerCase() === 'false',
			success: true
		});
	}.bind(this));
};

NamecheapDomains.prototype.getTldList = function() {
	this.nc._notImplemented(arguments);
};

/**
 * @param domain
 * @param info
 * @param info.reg
 * @param info.tech
 * @param info.admin
 * @param info.aux
 * @param callback
 */
NamecheapDomains.prototype.setContacts = function(domain,info,callback) {
	var method = 'domains.setContacts';
	if ( typeof domain !== 'string' || typeof info !== 'object' || info === null ) {
		this.nc._error(method+': missing one or more required string parameters - domain',callback);
		return;
	}
	domain = domain.trim().toLowerCase().substr(0,70);
	var flatInfo = WhoisMapper.fromTreeToFlat(info);
	if ( !domain || flatInfo.missingRequired.length ) {
		this.nc._error(method+': missing one or more required parameters (empty) - domain, required info fields',callback);
		return;
	}
	var requestObj = l.merge({},flatInfo.out,{
		DomainName: domain
	});
	this.nc._query(method,requestObj,function setContactsCallback(err,res) {
		if ( err ) {
			this.nc._error(err,callback);
			return;
		}
		if ( typeof res.DomainSetContactResult !== 'object' ||
			typeof res.DomainSetContactResult[0] !== 'object' ||
			typeof res.DomainSetContactResult[0].$ !== 'object' ) {
			this.nc._error(method+': no domain set contacts result',callback);
			return;
		}
		var sub = res.DomainSetContactResult[0].$;
		if ( typeof sub.Domain !== 'string' ) {
			this.nc._error(method+': only got a partial set contacts result, cannot validate',callback);
			return;
		}
		if ( sub.Domain.toLowerCase() !== domain.toLowerCase() ) {
			this.nc._error(method+': invalid set contacts response, expected "'+domain+'" got "'+sub.Domain+'"',callback);
			return;
		}
		if ( sub.IsSuccess && sub.IsSuccess.toLowerCase() !== 'true' ) {
			this.nc._error(method+': API said it could not set contacts for "'+domain+'"',callback);
			return;
		}
		callback(null,{
			domain: domain,
			success: true
		});
	}.bind(this));
};

NamecheapDomains.prototype.check = function(domainList,callback) {
	var method = 'domains.check';
	if ( typeof domainList === 'undefined' ) {
		domainList = '';
	}
	if ( typeof domainList === 'string' ) {
		domainList = domainList.split(',');
	}
	if ( !Array.isArray(domainList) ) {
		this.nc._error(method+': invalid domainList, expecting array or comma-delimited string',callback);
		return;
	}
	domainList = domainList.map(function domainListMap(v) {
		if ( typeof v !== 'string' ) {
			v = '';
		}
		return v.trim().substr(0,127); // rfc1035, 63 chars per label plus 1 for dot
	}).filter(function domainListFilter(v) {
		return !!v;
	});
	if ( !domainList.length ) {
		this.nc._error(method+': invalid domainList, empty',callback);
		return;
	}
	this.nc._query(method,{
		DomainList: domainList.join(',')
	},function checkCallback(err,res) {
		if ( err ) {
			this.nc._error(err,callback);
			return;
		}
		if ( typeof res.DomainCheckResult !== 'object' && !Array.isArray(res.DomainCheckResult) ) {
			this.nc._error('no domain result',callback);
			return;
		}
		var list = {};
		for ( var i = 0, iLen = res.DomainCheckResult.length; i < iLen; i++ ) {
			if ( typeof res.DomainCheckResult[i].$ === 'object' &&
					typeof res.DomainCheckResult[i].$.Domain === 'string' &&
					typeof res.DomainCheckResult[i].$.Available === 'string' ) {
				list[res.DomainCheckResult[i].$.Domain] = res.DomainCheckResult[i].$.Available.toLowerCase() === 'true';
			}
		}
		callback(null,list);
	}.bind(this));
};

NamecheapDomains.prototype.reactivate = function(domain,callback) {
	var method = 'domains.reactivate';
	if ( typeof domain !== 'string' ) {
		this.nc._error(method+': missing one or more required string parameters - domain',callback);
		return;
	}
	domain = domain.trim().toLowerCase().substr(0,70);
	if ( !domain ) {
		this.nc._error(method+': missing one or more required parameters (empty) - domain',callback);
		return;
	}
	this.nc._query(method,{
		DomainName: domain
	},function reactivateCallback(err,res) {
		if ( err ) {
			this.nc._error(err,callback);
			return;
		}
		if ( typeof res.DomainReactivateResult !== 'object' ||
			typeof res.DomainReactivateResult[0] !== 'object' ||
			typeof res.DomainReactivateResult[0].$ !== 'object' ) {
			this.nc._error(method+': no domain reactivation result',callback);
			return;
		}
		var sub = res.DomainReactivateResult[0].$;
		if ( typeof sub.Domain !== 'string' ) {
			this.nc._error(method+': only got a partial reactivation result, cannot validate',callback);
			return;
		}
		if ( sub.Domain.toLowerCase() !== domain.toLowerCase() ) {
			this.nc._error(method+': invalid reactivate domain response, expected "'+domain+'" got "'+sub.Domain+'"',callback);
			return;
		}
		if ( sub.IsSuccess && sub.IsSuccess.toLowerCase() !== 'true' ) {
			this.nc._error(method+': API said it could not reactivate domain for "'+domain+'"',callback);
			return;
		}
		callback(null,{
			domain: domain,
			amount: sub.ChargedAmount || '',
			orderId: sub.OrderID || '',
			transactionId: sub.TransactionID || '',
			success: true
		});
	}.bind(this));
};

NamecheapDomains.prototype.renew = function(domain,years,promo,callback) {
	var args = Array.prototype.slice.call(arguments,2);
	callback = args.pop();
	promo = args.length ? args.shift() : '';

	var method = 'domains.renew';
	if ( typeof domain !== 'string' ) {
		this.nc._error(method+': missing one or more required string parameters - domain',callback);
		return;
	}
	domain = domain.trim().toLowerCase().substr(0,70);
	years = Number((years+'').trim().toLowerCase().substr(0,2)) | 0;
	promo = promo.trim().substr(0,20);
	if ( !domain ) {
		this.nc._error(method+': missing one or more required parameters (empty) - domain',callback);
		return;
	}
	if ( isNaN(years) || years < 1 || years > 9 ) {
		this.nc._error(method+': missing years or the renewal length is not within the bounds of 1-9',callback);
		return;
	}
	var requestObj = {
		DomainName: domain,
		Years: years
	};
	if ( promo ) {
		requestObj.PromotionCode = promo;
	}
	this.nc._query(method,requestObj,function renewCallback(err,res,serverDetails) {
		if ( err ) {
			this.nc._error(err,callback);
			return;
		}
		if ( typeof res.DomainRenewResult !== 'object' ||
			typeof res.DomainRenewResult[0] !== 'object' ||
			typeof res.DomainRenewResult[0].$ !== 'object' ) {
			this.nc._error(method+': no domain renewal result',callback);
			return;
		}
		var sub = res.DomainRenewResult[0].$;
		if ( typeof sub.DomainName !== 'string' ) {
			this.nc._error(method+': only got a partial renewal result, cannot validate',callback);
			return;
		}
		if ( sub.DomainName.toLowerCase() !== domain.toLowerCase() ) {
			this.nc._error(method+': invalid renewal domain response, expected "'+domain+'" got "'+sub.DomainName+'"',callback);
			return;
		}
		if ( sub.Renew && sub.Renew.toLowerCase() !== 'true' ) {
			this.nc._error(method+': API said it could not renew domain for "'+domain+'"',callback);
			return;
		}
		var resultYears = '0',
			resultExpiredDate = '',
			top = res.DomainRenewResult[0];
		if ( top.DomainDetails && top.DomainDetails[0] ) {
			if ( top.DomainDetails[0].NumYears && top.DomainDetails[0].NumYears[0] ) {
				resultYears = Number(top.DomainDetails[0].NumYears[0]);
			}
			if ( top.DomainDetails[0].ExpiredDate && top.DomainDetails[0].ExpiredDate[0] ) {
				resultExpiredDate = new Date(top.DomainDetails[0].ExpiredDate[0]+' '+serverDetails.gmtOffset);
			}
		}
		callback(null,{
			domain: domain,
			domainId: sub.DomainID || '',
			amount: sub.ChargedAmount || '',
			orderId: sub.OrderID || '',
			transactionId: sub.TransactionID || '',
			years: resultYears,
			expiredDate: resultExpiredDate,
			success: true
		});
	}.bind(this));
};

NamecheapDomains.prototype.getRegistrarLock = function() {
	this.nc._notImplemented(arguments);
};

NamecheapDomains.prototype.setRegistrarLock = function() {
	this.nc._notImplemented(arguments);
};

NamecheapDomains.prototype.getInfo = function(domain,callback) {
	var method = 'domains.getInfo';
	if ( typeof domain !== 'string' ) {
		this.nc._error(method+': missing one or more required string parameters - domain',callback);
		return;
	}
	domain = domain.trim().toLowerCase().substr(0,70);
	if ( !domain ) {
		this.nc._error(method+': missing one or more required parameters (empty) - domain',callback);
		return;
	}
	this.nc._query(method,{
		DomainName: domain
	},function infoCallback(err,res,serverDetails) {
		if ( err ) {
			this.nc._error(err,callback);
			return;
		}
		if ( typeof res.DomainGetInfoResult !== 'object' ||
				typeof res.DomainGetInfoResult[0] !== 'object' ||
				typeof res.DomainGetInfoResult[0].$ !== 'object' ||
				typeof res.DomainGetInfoResult[0].$.Status !== 'string' ) {
			this.nc._error(method+': no domain get info result',callback);
			return;
		}
		var sub = res.DomainGetInfoResult[0];
		var attr = sub.$;
		var result = {
			status: attr.Status.toLowerCase(), // one of NamecheapDomains.DOMAIN_*
			createdDate: null,
			expiredDate: null,
			wg: null,
			wgId: null,
			wgExpiredDate: null,
			success: true
		};
		if ( typeof attr.ID !== 'undefined' ) {
			result.domainId = attr.ID;
		}
		if ( typeof attr.DomainName !== 'undefined' ) {
			result.domain = attr.DomainName;
		} else {
			result.domain = domain;
		}
		if ( sub.Whoisguard && typeof sub.Whoisguard[0] === 'object' ) {
			var wgSub = sub.Whoisguard[0];
			if ( wgSub.$ && typeof wgSub.$.Enabled === 'string' ) {
				result.wg = wgSub.$.Enabled.toLowerCase() === 'true';
			}
			if ( typeof wgSub.ID === 'object' && wgSub.ID[0] ) {
				result.wgId = wgSub.ID[0];
			}
			if ( typeof wgSub.ExpiredDate === 'object' && typeof wgSub.ExpiredDate[0] === 'string' ) {
				result.wgExpiredDate = new Date(wgSub.ExpiredDate[0]+' '+serverDetails.gmtOffset);
			}
		}
		if ( typeof sub.DomainDetails === 'object' && sub.DomainDetails[0] ) {
			var ddSub = sub.DomainDetails[0];
			if ( typeof ddSub.CreatedDate === 'object' && typeof ddSub.CreatedDate[0] === 'string' ) {
				result.createdDate = new Date(ddSub.CreatedDate[0]+' '+serverDetails.gmtOffset);
			}
			if ( typeof ddSub.ExpiredDate === 'object' && typeof ddSub.ExpiredDate[0] === 'string' ) {
				result.expiredDate = new Date(ddSub.ExpiredDate[0]+' '+serverDetails.gmtOffset);
			}
		}
		callback(null,result);
	}.bind(this));
};
