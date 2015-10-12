var NamecheapAPI,
	NamecheapRequest	= require('./NamecheapRequest.js'),
	NamecheapResponse	= require('./NamecheapResponse.js'),
	NamecheapDomains	= require('./NamecheapDomains.js'),
	NamecheapSSL		= require('./NamecheapSSL.js'),
	NamecheapUsers		= require('./NamecheapUsers.js'),
	NamecheapWhoisGuard	= require('./NamecheapWhoisGuard.js'),
	RateLimit			= require('afo-ratelimit'),
	l = require('lodash');

/**
 * @type RateLimit
 */
var rateLimitInstance;

/**
 * @class NamecheapAPI
 * @constructor
 * @param {object} config
 * @param {string} config.apiUser
 * @param {string} config.apiKey
 * @param {string} config.userName
 * @param {string} config.clientIP
 * @param {boolean} config.isSandbox
 * @param {function} config.logContext
 * @param {RateLimit.config} config.rateLimiter Either a RateLimit config, null/undefined for defaults, or false to disable.
 * @param {object} config.endPoints
 * @param {string} config.endPoints.production
 * @param {string} config.endPoints.sandbox
 */
module.exports = NamecheapAPI = function(config) {
	this.config = l.merge({
		apiUser: '',
		apiKey: '',
		userName: '',
		clientIP: '',
		isSandbox: false,
		logContext: console,
		rateLimiter: null,
		endPoints: {
			production: 'https://api.namecheap.com/xml.response',
			sandbox: 'https://api.sandbox.namecheap.com/xml.response'
		}
	},config);
	this.nc = this;
	this.rateLimit = null;
	if ( this.config.rateLimiter !== false ) {
		this.rateLimit = rateLimitInstance || new RateLimit(this.config.rateLimiter);
	}
};

/**
 * @name NamecheapAPI#domains
 * @type NamecheapDomains
 * @readonly
 */

/**
 * @name NamecheapAPI#ssl
 * @type NamecheapSSL
 * @readonly
 */

/**
 * @name NamecheapAPI#users
 * @type NamecheapUsers
 * @readonly
 */

/**
 * @name NamecheapAPI#whoisguard
 * @type NamecheapWhoisGuard
 * @readonly
 */

/**
 * @name NamecheapAPI#queueId
 * @type string
 * @readonly
 */

/**
 * @name NamecheapAPI#endPointName
 * @type string
 * @readonly
 */

Object.defineProperties(NamecheapAPI.prototype,{
	domains: {
		/**
		 * @this NamecheapAPI
		 * @returns {NamecheapDomains}
		 */
		get: function() {
			this._domains = this._domains || new NamecheapDomains(this.nc);
			return this._domains;
		}
	},
	ssl: {
		/**
		 * @this NamecheapAPI
		 * @returns {NamecheapSSL}
		 */
		get: function() {
			this._ssl = this._ssl || new NamecheapSSL(this.nc);
			return this._ssl;
		}
	},
	users: {
		/**
		 * @this NamecheapAPI
		 * @returns {NamecheapUsers}
		 */
		get: function() {
			this._users = this._users || new NamecheapUsers(this.nc);
			return this._users;
		}
	},
	whoisguard: {
		/**
		 * @this NamecheapAPI
		 * @returns {NamecheapWhoisGuard}
		 */
		get: function() {
			this._whoisguard = this._whoisguard || new NamecheapWhoisGuard(this.nc);
			return this._whoisguard;
		}
	},
	queueId: {
		/**
		 * @this NamecheapAPI
		 * @returns {string}
		 */
		get: function() {
			return this.config.apiUser+'.'+this.endPointName;
		}
	},
	endPointName: {
		/**
		 * @this NamecheapAPI
		 * @returns {string}
		 */
		get: function() {
			return this.config.isSandbox?'sandbox':'production';
		}
	}
});

/**
 * @param {string} command
 * @param {object} params
 * @param {string} [method=NamecheapRequest.HTTP_DEFAULT]
 * @param {ncResponseCallback} [callback]
 */
NamecheapAPI.prototype._query = function(command,params,method,callback) {
	var ncRequest;
	Array.prototype.slice.call(arguments,2).forEach(function argvIterator(v) {
		if ( typeof v === 'function' ) {
			callback = v;
		} else {
			method = v;
		}
	});
	if ( typeof command !== 'string' ) {
		command = 'noop';
	}
	command = command.trim();
	if ( !command.length ) {
		command = 'noop';
	}
	if ( command.indexOf('namecheap.') !== 0 ) {
		command = 'namecheap.'+command;
	}
	if ( typeof params !== 'object' || !params ) {
		params = {};
	}
	if ( typeof method !== 'string' ) {
		method = NamecheapRequest.HTTP_DEFAULT;
	}
	if ( typeof callback !== 'function' ) {
		callback = function internalNoopCallback(){};
	}
	method = method.toUpperCase();
	params = l.merge({},params,{
		ApiUser: this.config.apiUser,
		ApiKey: this.config.apiKey,
		UserName: this.config.userName,
		ClientIp: this.config.clientIP,
		Command: command
	});
	ncRequest = new NamecheapRequest(
		this.config.endPoints[this.endPointName],
		params,
		method
	);
	this._addRequestToQueue(ncRequest,callback);
};

/**
 * @param {Error|null} err
 * @param {string} body
 * @param {ncResponseCallback} callback
 * @private
 */
NamecheapAPI.prototype._handleResponse = function(err,body,callback) {
	NamecheapResponse.prepare(err,body,callback);
};

/**
 * @param {NamecheapRequest} ncRequest
 * @param {ncResponseCallback} callback
 * @private
 */
NamecheapAPI.prototype._addRequestToQueue = function(ncRequest,callback) {
	var fn = ncRequest.send.bind(ncRequest,function(err,body) {
		this._handleResponse(err,body,callback);
	}.bind(this));
	if ( this.rateLimit ) {
		this.rateLimit.addToQueue(this.queueId,fn);
	} else {
		setImmediate(fn);
	}
};

/**
 * @const
 * @type {string}
 * @default
 */
NamecheapAPI.ERROR_UNKNOWN			= 'An unknown error occurred.';

/**
 * @const
 * @type {string}
 * @default
 */
NamecheapAPI.ERROR_NOTIMPLEMENTED	= 'API method not implemented.';

/**
 * @callback errorCallback
 * @param {Error|null} err
 */

/**
 * @param {string|Error} err
 * @param {errorCallback} callback
 * @protected
 */
NamecheapAPI.prototype._error = function(err,callback) {
	if ( typeof callback !== 'function' ) {
		return;
	}
	if ( typeof err !== 'string' && !(err instanceof Error) ) {
		err = '';
	}
	if ( typeof err === 'string' ) {
		if ( !err ) {
			err = NamecheapAPI.ERROR_UNKNOWN;
		}
		err = new Error(err);
	}
	if ( typeof callback !== 'function' ) { // never gets here
		// TODO: support for log level parameter and invocation
		if ( typeof this.config.logContext === 'object' ) {
			this.config.logContext.log(err);
		}
	} else {
		callback(err,null);
	}
};

/**
 * @param {array|Arguments|errorCallback} argv
 * @protected
 */
NamecheapAPI.prototype._notImplemented = function(argv) {
	var cb = null;
	if ( typeof argv === 'function' ) {
		cb = argv;
	} else {
		cb = Array.prototype.slice.call(argv,0).pop() || null;
	}
	this._error(NamecheapAPI.ERROR_NOTIMPLEMENTED,cb);
};
