var NamecheapRequest,
	Perry	= require('perry'),
	stread	= require('stread'),
	http	= require('http'),
	https	= require('https'),
	url		= require('url');

/**
 * @class NamecheapRequest
 * @constructor
 * @param {string} endpoint Where to send the request to
 * @param {object} parameters Request params
 * @param {string} [method=NamecheapRequest.HTTP_DEFAULT] One of NamcheapRequest.HTTP_*
 */
module.exports = NamecheapRequest = function(endpoint,parameters,method) {
	this.endpoint	= endpoint;
	this.parameters	= parameters || {};
	this.method		= method || NamecheapRequest.HTTP_DEFAULT;
};

/**
 * @const
 * @type {string}
 * @default
 */
NamecheapRequest.HTTP_DEFAULT	= 'GET';

/**
 * @const
 * @type {string}
 * @default
 */
NamecheapRequest.HTTP_GET		= 'GET';

/**
 * @const
 * @type {string}
 * @default
 */
NamecheapRequest.HTTP_POST		= 'POST';

/**
 * @callback ncRequestCallback
 * @param {Error|null} err
 * @param {string} body
 */

/**
 * @param {ncRequestCallback} callback
 */
NamecheapRequest.prototype.send = function(callback) {
	var endpoint	= url.parse(this.endpoint),
		isSecure	= ( typeof endpoint.protocol === 'string' ? endpoint.protocol.indexOf('https') === 0 : false ),
		client		= ( isSecure ? https : http ),
		queryString	= Perry.stringify(this.parameters),
		definedPort = Number(endpoint.port),
		options		= {
			hostname: endpoint.hostname,
			port: ( !isNaN(definedPort) && definedPort !== 0 ? definedPort : ( isSecure ? 443 : 80 ) ),
			method: this.method || NamecheapRequest.HTTP_DEFAULT,
			path: endpoint.path,
			agent: false
		};
	if ( options.method !== NamecheapRequest.HTTP_POST && queryString.length ) {
		options.path += ( ~options.path.indexOf('?') ? '&' : '?' ) + queryString;
	}
	this._request(client,queryString,options,callback);
};

/**
 *
 * @param {http|https} client
 * @param {string} queryString
 * @param {object} options Options specified in http[s].request
 * @param {ncRequestCallback} callback
 * @protected
 */
NamecheapRequest.prototype._request = function(client,queryString,options,callback) {
	var req;
	function sendComplete(err,body) {
		if ( typeof callback === 'function' ) {
			callback(err,body);
			callback = null;
			if ( !err ) {
				req.removeListener('error',sendComplete);
			}
		}
	}
	function reqCallback(res) {
		var buffer = '',
			onData = function onData(chunk) {
				buffer += chunk;
			},
			onEnd = function onEnd() {
				res.removeListener('data',onData);
				res.removeListener('error',onError);
				sendComplete(null,buffer);
			},
			onError = function onError(err) {
				res.removeListener('data',onData);
				res.removeListener('end',onEnd);
				sendComplete(err,buffer);
			};
		res.on('data',onData).once('end',onEnd).once('error',onError).setEncoding('utf8');
	}
	req = client.request(options,reqCallback).once('error',sendComplete);
	if ( options.method === NamecheapRequest.HTTP_POST ) {
		stread(queryString).pipe(req);
	} else {
		req.end();
	}
};

/**
 *
 * @param {string} endpoint Where to send the request to
 * @param {object} parameters Request params
 * @param {string} method One of NamcheapRequest.HTTP_*
 * @param {ncRequestCallback} callback
 */
NamecheapRequest.send = function(endpoint,parameters,method,callback) {
	new NamecheapRequest(endpoint,parameters,method).send(callback);
};
