var NamecheapDomainsNS;

module.exports = NamecheapDomainsNS = function(nc) {
	this.nc = nc;
};

// methods for this namespace
NamecheapDomainsNS.prototype.create = function(sld,tld,ns,ip,callback) {
	var method = 'domains.ns.create';
	if ( typeof sld !== 'string' ||
			typeof tld !== 'string' ||
			typeof ns !== 'string' ||
			typeof ip !== 'string' ) {
		this.nc._error(method+': missing one or more required string parameters - sld, tld, ns, ip',callback);
		return;
	}
	sld = sld.trim().toLowerCase().substr(0,70);
	tld = tld.trim().toLowerCase().substr(0,10);
	ns = ns.trim().toLowerCase().substr(0,150);
	ip = ip.trim().toLowerCase().substr(0,15);
	if ( !sld || !tld || !ns || !ip ) {
		this.nc._error(method+': missing one or more required parameters (empty) - sld, tld, ns, ip',callback);
		return;
	}
	this.nc._query(method,{
		SLD: sld,
		TLD: tld,
		Nameserver: ns,
		IP: ip
	},function nsCreateCallback(err,res) {
		if ( err ) {
			this.nc._error(err,callback);
			return;
		}
		if ( typeof res.DomainNSCreateResult !== 'object' ||
				typeof res.DomainNSCreateResult[0] !== 'object' ||
				typeof res.DomainNSCreateResult[0].$ !== 'object' ) {
			this.nc._error(method+': no nameserver creation result',callback);
			return;
		}
		var sub = res.DomainNSCreateResult[0].$;
		if ( typeof sub.Domain !== 'string' ||
				typeof sub.Nameserver !== 'string' ||
				typeof sub.IP !== 'string' ||
				typeof sub.IsSuccess !== 'string' ) {
			this.nc._error(method+': only got a partial nameserver creation result, cannot validate',callback);
			return;
		}
		var fqdn = sld+'.'+tld;
		if ( sub.Domain.toLowerCase() !== fqdn.toLowerCase() ) {
			this.nc._error(method+': invalid nameserver creation domain response, expected "'+fqdn+'" got "'+sub.Domain+'"',callback);
			return;
		}
		if ( sub.Nameserver.toLowerCase() !== ns.toLowerCase() ) {
			this.nc._error(method+': invalid nameserver creation ns response, expected "'+ns+'" got "'+sub.Nameserver+'"',callback);
			return;
		}
		if ( sub.IP.toLowerCase() !== ip.toLowerCase() ) {
			this.nc._error(method+': invalid nameserver creation ip response, expected "'+ip+'" got "'+sub.IP+'"',callback);
			return;
		}
		if ( sub.IsSuccess.toLowerCase() !== 'true' ) {
			this.nc._error(method+': API said it could not create the nameserver for "'+ns+'"',callback);
			return;
		}
		callback(null,{
			sld: sld,
			tld: tld,
			ns: ns,
			ip: ip,
			fqdn: fqdn,
			success: true
		});
	}.bind(this));
};

NamecheapDomainsNS.prototype.delete = function(sld,tld,ns,callback) {
	var method = 'domains.ns.delete';
	if ( typeof sld !== 'string' ||
		typeof tld !== 'string' ||
		typeof ns !== 'string' ) {
		this.nc._error(method+': missing one or more required string parameters - sld, tld, ns',callback);
		return;
	}
	sld = sld.trim().toLowerCase().substr(0,70);
	tld = tld.trim().toLowerCase().substr(0,10);
	ns = ns.trim().toLowerCase().substr(0,150);
	if ( !sld || !tld || !ns ) {
		this.nc._error(method+': missing one or more required parameters (empty) - sld, tld, ns',callback);
		return;
	}
	this.nc._query(method,{
		SLD: sld,
		TLD: tld,
		Nameserver: ns
	},function nsDeleteCallback(err,res) {
		if ( err ) {
			this.nc._error(err,callback);
			return;
		}
		if ( typeof res.DomainNSDeleteResult !== 'object' ||
			typeof res.DomainNSDeleteResult[0] !== 'object' ||
			typeof res.DomainNSDeleteResult[0].$ !== 'object' ) {
			this.nc._error(method+': no nameserver delete result',callback);
			return;
		}
		var sub = res.DomainNSDeleteResult[0].$;
		if ( typeof sub.Domain !== 'string' ||
			typeof sub.Nameserver !== 'string' ||
			typeof sub.IsSuccess !== 'string' ) {
			this.nc._error(method+': only got a partial nameserver delete result, cannot validate',callback);
			return;
		}
		var fqdn = sld+'.'+tld;
		if ( sub.Domain.toLowerCase() !== fqdn.toLowerCase() ) {
			this.nc._error(method+': invalid nameserver delete domain response, expected "'+fqdn+'" got "'+sub.Domain+'"',callback);
			return;
		}
		if ( sub.Nameserver.toLowerCase() !== ns.toLowerCase() ) {
			this.nc._error(method+': invalid nameserver delete ns response, expected "'+ns+'" got "'+sub.Nameserver+'"',callback);
			return;
		}
		if ( sub.IsSuccess.toLowerCase() !== 'true' ) {
			this.nc._error(method+': API said it could not delete the nameserver for "'+ns+'"',callback);
			return;
		}
		callback(null,{
			sld: sld,
			tld: tld,
			ns: sub.Nameserver,
			fqdn: fqdn,
			success: true
		});
	}.bind(this));
};

NamecheapDomainsNS.prototype.getInfo = function(sld,tld,ns,callback) {
	var method = 'domains.ns.getInfo';
	if ( typeof sld !== 'string' ||
		typeof tld !== 'string' ||
		typeof ns !== 'string' ) {
		this.nc._error(method+': missing one or more required string parameters - sld, tld, ns',callback);
		return;
	}
	sld = sld.trim().toLowerCase().substr(0,70);
	tld = tld.trim().toLowerCase().substr(0,10);
	ns = ns.trim().toLowerCase().substr(0,150);
	if ( !sld || !tld || !ns ) {
		this.nc._error(method+': missing one or more required parameters (empty) - sld, tld, ns',callback);
		return;
	}
	this.nc._query(method,{
		SLD: sld,
		TLD: tld,
		Nameserver: ns
	},function nsGetInfoCallback(err,res) {
		if ( err ) {
			this.nc._error(err,callback);
			return;
		}
		if ( typeof res.DomainNSInfoResult !== 'object' ||
			typeof res.DomainNSInfoResult[0] !== 'object' ||
			typeof res.DomainNSInfoResult[0].$ !== 'object' ) {
			this.nc._error(method+': no nameserver info result',callback);
			return;
		}
		var sub = res.DomainNSInfoResult[0].$;
		if ( typeof sub.Domain !== 'string' ||
			typeof sub.Nameserver !== 'string' ||
			typeof sub.IP !== 'string' ) {
			this.nc._error(method+': only got a partial nameserver info result, cannot validate',callback);
			return;
		}
		var fqdn = sld+'.'+tld;
		if ( sub.Domain.toLowerCase() !== fqdn.toLowerCase() ) {
			this.nc._error(method+': invalid nameserver info domain response, expected "'+fqdn+'" got "'+sub.Domain+'"',callback);
			return;
		}
		if ( sub.Nameserver.toLowerCase() !== ns.toLowerCase() ) {
			this.nc._error(method+': invalid nameserver info ns response, expected "'+ns+'" got "'+sub.Nameserver+'"',callback);
			return;
		}
		var status = [];
		if ( typeof res.DomainNSInfoResult[0].NameserverStatuses === 'object' &&
			typeof res.DomainNSInfoResult[0].NameserverStatuses[0] === 'object' &&
			typeof res.DomainNSInfoResult[0].NameserverStatuses[0].Status === 'object' &&
			Array.isArray(res.DomainNSInfoResult[0].NameserverStatuses[0].Status) ) {
			status = res.DomainNSInfoResult[0].NameserverStatuses[0].Status;
		}
		callback(null,{
			sld: sld,
			tld: tld,
			ns: sub.Nameserver,
			ip: sub.IP,
			fqdn: fqdn,
			status: status,
			success: true
		});
	}.bind(this));
};

NamecheapDomainsNS.prototype.update = function(sld,tld,ns,ip,ipOld,callback) {
	var method = 'domains.ns.update';
	if ( typeof sld !== 'string' ||
		typeof tld !== 'string' ||
		typeof ns !== 'string' ||
		typeof ip !== 'string' ||
		typeof ipOld !== 'string' ) {
		this.nc._error(method+': missing one or more required string parameters - sld, tld, ns, ip, ipOld',callback);
		return;
	}
	sld = sld.trim().toLowerCase().substr(0,70);
	tld = tld.trim().toLowerCase().substr(0,10);
	ns = ns.trim().toLowerCase().substr(0,150);
	ip = ip.trim().toLowerCase().substr(0,15);
	ipOld = ipOld.trim().toLowerCase().substr(0,15);
	if ( !sld || !tld || !ns || !ip || !ipOld ) {
		this.nc._error(method+': missing one or more required parameters (empty) - sld, tld, ns, ip, ipOld',callback);
		return;
	}
	this.nc._query(method,{
		SLD: sld,
		TLD: tld,
		Nameserver: ns,
		IP: ip,
		OldIP: ipOld
	},function nsUpdateCallback(err,res) {
		if ( err ) {
			this.nc._error(err,callback);
			return;
		}
		if ( typeof res.DomainNSUpdateResult !== 'object' ||
			typeof res.DomainNSUpdateResult[0] !== 'object' ||
			typeof res.DomainNSUpdateResult[0].$ !== 'object' ) {
			this.nc._error(method+': no nameserver update result',callback);
			return;
		}
		var sub = res.DomainNSUpdateResult[0].$;
		if ( typeof sub.Domain !== 'string' ||
			typeof sub.Nameserver !== 'string' ||
			typeof sub.IsSuccess !== 'string' ) {
			this.nc._error(method+': only got a partial nameserver update result, cannot validate',callback);
			return;
		}
		var fqdn = sld+'.'+tld;
		if ( sub.Domain.toLowerCase() !== fqdn.toLowerCase() ) {
			this.nc._error(method+': invalid nameserver update domain response, expected "'+fqdn+'" got "'+sub.Domain+'"',callback);
			return;
		}
		if ( sub.Nameserver.toLowerCase() !== ns.toLowerCase() ) {
			this.nc._error(method+': invalid nameserver update ns response, expected "'+ns+'" got "'+sub.Nameserver+'"',callback);
			return;
		}
		if ( sub.IsSuccess.toLowerCase() !== 'true' ) {
			this.nc._error(method+': API said it could not update the nameserver for "'+ns+'"',callback);
			return;
		}
		callback(null,{
			sld: sld,
			tld: tld,
			ns: ns,
			ip: ip,
			ipOld: ipOld,
			fqdn: fqdn,
			success: true
		});
	}.bind(this));
};
