var NamecheapResponse,
	xml2js = require('xml2js');

/**
 * @callback ncResponseCallback
 * @param {Error|null} err
 * @param {object|undefined|null} commandResponseObject The command-specific part of the response as parsed from xml2js
 * @param {object|undefined|null} serverDetails Normalized server details regarding the request
 * @param {string} serverDetails.serverName Remote server name
 * @param {string} serverDetails.gmtOffset TZ string representing GMT offset, e.g. GMT-5 or GMT+5
 * @param {Number} serverDetails.executionTime Float representing number of seconds
 */

/**
 * @class NamecheapResponse
 * @constructor
 * @param {Error|null} err Response error, if any
 * @param {string|null} res Response body (utf8), if any
 * @param {ncResponseCallback} [callback] Define the callback to be invoked when done parsing
 */
module.exports = NamecheapResponse = function(err,res,callback) {
	this.err		= err || null;
	this.res		= res || null;
	if ( typeof callback !== 'function' ) {
		callback = function internalNoopCallback(){/*noop*/};
	}
	this.callback	= callback;
};

/**
 * @param {ncResponseCallback} [callback] Updates the instance callback.
 */
NamecheapResponse.prototype.prepare = function(callback) {
	if ( typeof callback === 'function' ) {
		this.callback = callback;
	} else {
		callback = this.callback;
	}
	if ( this.err ) {
		callback(this.err,null);
		return;
	}
	if ( typeof this.res !== 'string' ) {
		callback(new Error('invalid response from API, not a string'),null);
		return;
	}
	this.res = this.res.trim();
	if ( !this.res ) {
		callback(new Error('invalid response from API, empty'),null);
		return;
	}
	xml2js.parseString(this.res,{async:true,attrkey:'$',charkey:'_'},this._onXMLParse.bind(this));
};

/**
 * @param {Error|null} err
 * @param {object} json Parsed JSON from xml2js
 * @private
 */
NamecheapResponse.prototype._onXMLParse = function(err,json) {
	var callback = this.callback;
	if ( err ) {
		callback(err);
		return;
	}
	if ( typeof json !== 'object' ) {
		callback(new Error('invalid json, expected [object Object] got '+(typeof json)));
	}
	if ( typeof json.ApiResponse === 'undefined' ) {
		callback(new Error('bad response from api, no valid response object'));
		return;
	}
	if ( typeof json.ApiResponse.$ === 'undefined' || typeof json.ApiResponse.$.Status !== 'string' ) {
		callback(new Error('bad response from api, no status code'));
		return;
	}
	var apiRes = json.ApiResponse;
	if ( apiRes.$.Status.toUpperCase() !== 'OK' ) {
		try {
			if ( typeof apiRes.Errors[0].Error[0]._ !== 'undefined' ) {
				var errPath = apiRes.Errors[0].Error[0];
				var errApi = new Error(errPath._);
				if ( typeof errPath.$.Number !== 'undefined' ) {
					errApi.code = Number(errPath.$.Number);
				}
				callback(errApi);
			} else {
				callback(new Error('unknown error'));
			}
		} catch (e) {
			callback(new Error('unknown error'));
		}
		return;
	}
	if ( typeof apiRes.RequestedCommand === 'undefined' || typeof apiRes.RequestedCommand[0] === 'undefined' ) {
		callback(new Error('API did not send back the requested command for verification'));
		return;
	}
	if ( typeof apiRes.CommandResponse === 'undefined' ||
			typeof apiRes.CommandResponse[0] === 'undefined' ||
			typeof apiRes.CommandResponse[0].$ === 'undefined' ||
			typeof apiRes.CommandResponse[0].$.Type === 'undefined' ) {
		callback(new Error('API did not send back the command response'));
		return;
	}
	if ( apiRes.RequestedCommand[0] !== apiRes.CommandResponse[0].$.Type ) {
		callback(new Error('API request and response command type mismatch'));
		return;
	}
	var serverDetails = {
		serverName: '',
		gmtOffset: 'GMT',
		executionTime: 0
	};
	if ( typeof apiRes.Server === 'object' && apiRes.Server[0] ) {
		serverDetails.serverName = apiRes.Server[0];
	}
	if ( typeof apiRes.GMTTimeDifference === 'object' && typeof apiRes.GMTTimeDifference[0] === 'string' ) {
		serverDetails.gmtOffset = 'GMT'+apiRes.GMTTimeDifference[0]
									.replace(':','')
									.replace('+-','+')
									.replace('-+','-')
									.replace(/(-+)/g,'-')
									.replace(/(\++)/g,'+');
	}
	if ( typeof apiRes.ExecutionTime === 'object' && apiRes.ExecutionTime[0] ) {
		serverDetails.executionTime = Number(apiRes.ExecutionTime[0]);
	}
	callback(null,apiRes.CommandResponse[0],serverDetails);
};

/**
 * Static response preparation invocation.
 * This is like instantiating a new `NamecheapResponse` and then invoking `prepare` on it.
 * @param {Error|null} err Response error, if any
 * @param {string|null} res Response body (utf8), if any
 * @param {ncResponseCallback} callback Invoked when done parsing
 * @static
 */
NamecheapResponse.prepare = function(err,res,callback) {
	new NamecheapResponse(err,res).prepare(callback);
};
