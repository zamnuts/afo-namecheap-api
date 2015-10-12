var NamecheapDomainsDNS;

module.exports = NamecheapDomainsDNS = function(nc) {
	this.nc = nc;
};

// methods for this namespace
NamecheapDomainsDNS.prototype.setDefault = function() {
	this.nc._notImplemented(arguments);
};

NamecheapDomainsDNS.prototype.setCustom = function(sld,tld,nsList,callback) {
	var method = 'domains.dns.setCustom';
	if ( typeof sld !== 'string' || typeof tld !== 'string' ) {
		this.nc._error(method+': missing one or more required string parameters - sld, tld',callback);
		return;
	}
	sld = sld.trim().toLowerCase().substr(0,70);
	tld = tld.trim().toLowerCase().substr(0,10);
	if ( !sld || !tld ) {
		this.nc._error(method+': missing one or more required parameters (empty) - sld, tld',callback);
		return;
	}
	if ( typeof nsList === 'undefined' ) {
		nsList = '';
	}
	if ( typeof nsList === 'string' ) {
		nsList = nsList.split(',');
	}
	if ( !Array.isArray(nsList) ) {
		this.nc._error(method+': invalid nsList, expecting array or comma-delimited string',callback);
		return;
	}
	nsList = nsList.map(function nsListMap(v) {
		if ( typeof v !== 'string' ) {
			v = '';
		}
		return v.trim().toLowerCase();
	}).filter(function nsListFilter(v) {
		return !!v;
	});
	if ( !nsList.length ) {
		this.nc._error(method+': invalid nsList, empty',callback);
		return;
	}
	var nsListStr = nsList.join(',');
	if ( nsListStr.length > 1200 ) {
		this.nc._error(method+': invalid nsList, exceeds 1200 characters when joined with including commas',callback);
		return;
	}
	this.nc._query(method,{
		SLD: sld,
		TLD: tld,
		Nameservers: nsListStr
	},function dnsSetCustomCallback(err,res) {
		if ( err ) {
			this.nc._error(err,callback);
			return;
		}
		if ( typeof res.DomainDNSSetCustomResult !== 'object' ||
				typeof res.DomainDNSSetCustomResult[0] !== 'object' ||
				typeof res.DomainDNSSetCustomResult[0].$ !== 'object' ) {
			this.nc._error(method+': no dns set custom ns result',callback);
			return;
		}
		var sub = res.DomainDNSSetCustomResult[0].$;
		if ( typeof sub.Domain !== 'string' ||
				typeof sub.Updated !== 'string' ) {
			this.nc._error(method+': only got a partial dns set custom result, cannot validate',callback);
			return;
		}
		var fqdn = sld+'.'+tld;
		if ( sub.Domain.toLowerCase() !== fqdn.toLowerCase() ) {
			this.nc._error(method+': invalid dns set custom response, expected "'+fqdn+'" got "'+sub.Domain+'"',callback);
			return;
		}
		if ( sub.Updated.toLowerCase() !== 'true' ) {
			this.nc._error(method+': API said it could not set custom dns for "'+fqdn+'" to "'+nsListStr+'"',callback);
			return;
		}
		callback(null,{
			sld: sld,
			tld: tld,
			nsList: nsList,
			fqdn: fqdn,
			success: true
		});
	}.bind(this));
};

NamecheapDomainsDNS.prototype.getList = function(sld,tld,callback) {
	var method = 'domains.dns.getList';
	if ( typeof sld !== 'string' || typeof tld !== 'string' ) {
		this.nc._error(method+': missing one or more required string parameters - sld, tld',callback);
		return;
	}
	sld = sld.trim().toLowerCase().substr(0,70);
	tld = tld.trim().toLowerCase().substr(0,10);
	if ( !sld || !tld ) {
		this.nc._error(method+': missing one or more required parameters (empty) - sld, tld',callback);
		return;
	}
	this.nc._query(method,{
		SLD: sld,
		TLD: tld
	},function dnsGetListCallback(err,res) {
		if ( err ) {
			this.nc._error(err,callback);
			return;
		}
		if ( typeof res.DomainDNSGetListResult !== 'object' ||
			typeof res.DomainDNSGetListResult[0] !== 'object' ||
			typeof res.DomainDNSGetListResult[0].$ !== 'object' ) {
			this.nc._error(method+': no dns get list result',callback);
			return;
		}
		var sub = res.DomainDNSGetListResult[0].$;
		if ( typeof sub.Domain !== 'string' ) {
			this.nc._error(method+': only got a partial dns list result, cannot validate',callback);
			return;
		}
		var fqdn = sld+'.'+tld;
		if ( sub.Domain.toLowerCase() !== fqdn.toLowerCase() ) {
			this.nc._error(method+': invalid dns list response, expected "'+fqdn+'" got "'+sub.Domain+'"',callback);
			return;
		}
		var customDNS = false;
		if ( sub.IsUsingOurDNS ) {
			customDNS = sub.IsUsingOurDNS.toLowerCase() !== 'true';
		}
		var nsList = [];
		if ( res.DomainDNSGetListResult[0].Nameserver && Array.isArray(res.DomainDNSGetListResult[0].Nameserver) ) {
			nsList = res.DomainDNSGetListResult[0].Nameserver;
		}
		callback(null,{
			sld: sld,
			tld: tld,
			nsList: nsList,
			fqdn: fqdn,
			customDNS: customDNS,
			success: true
		});
	}.bind(this));
};

NamecheapDomainsDNS.prototype.getHosts = function() {
	this.nc._notImplemented(arguments);
};

NamecheapDomainsDNS.prototype.getEmailForwarding = function() {
	this.nc._notImplemented(arguments);
};

NamecheapDomainsDNS.prototype.setEmailForwarding = function() {
	this.nc._notImplemented(arguments);
};

NamecheapDomainsDNS.prototype.setHosts = function() {
	this.nc._notImplemented(arguments);
};
