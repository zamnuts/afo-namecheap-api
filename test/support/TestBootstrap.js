var fs = require('fs'),
	path = require('path'),
	l = require('lodash'),
	expect = require('chai').use(require('dirty-chai')).expect,
	xml2js = require('xml2js');

/**
 * Just a no-operation.
 */
function noop() {
	/* NoOp */
}

/**
 * Async callback wrapper so thrown exceptions can be caught in the proper describe context.
 * @param {function} done The `done` function from `it`
 * @param {function} func The test's callback
 */
function asyncCheck(done,func) {
	try {
		func();
		done();
	} catch ( e ) {
		done(e);
	}
}

/**
 * Synchronously load an XML file fixture.
 * Loads relative to test/fixtures and adds the xml extension automatically.
 * @param {string} xmlName The fixture to load, e.g. "domains/ns/create-ok"
 */
function readXML(xmlName) {
	var filePath = path.normalize(__dirname + '/../fixtures/' + xmlName + '.xml');
	return fs.readFileSync(filePath,{encoding: 'utf8'});
}

/**
 * @callback invokeCallback
 * @param {Array} argv The argument vector to apply to the test function.
 */

/**
 * @callback expectCallback
 * @param {Error|null} err The argument vector to apply to the test function.
 * @param {...*} argv The rest of the arguments... if they exist.
 */

/**
 * This will perform arbitrary param value testing cycles.
 * It defaults to Null, Empty, and WhiteSpace-only (N.E.WS.) tests on non-skipped parameters.
 * The API does a lot of parameter checking and normalization, but each method's
 * arguments are handled slightly different, so this function should help automate testing.
 *
 * All values to cycle through are defined in the `valueConfig`. This is optional
 * and profiles defaults (as can be seen in the function body).
 *
 * All arguments must be defined in the `argConfig` so as to match the proper
 * parameters with the function signature. The last argument is assumed to be
 * the callback in the form of callback(err,result). The callback will be
 * automatically added and should not be accounted for in the `argConfig`.
 *
 * The test subject is to be invoked within the `cbInvoke` function with the
 * supplied argument vector.
 *
 * Example Usage:
 *   testArgs([
 *     { desc: 'null', value: null },
 *     { desc: 'empty', value: '' },
 *     { desc: 'whitespace', value: ' ' }
 *   ],[
 *     { param: 'sld', value: 'domain1', skip: false },
 *     { param: 'tld', value: 'com', skip: false },
 *     { param: 'ns', value: 'ns1.domain1.com', skip: false },
 *     { param: 'noTest', value: 'constant value', skip: true }
 *   ],function(argv) {
 *     nc.domains.ns.create.apply(nc.domains.ns,argv);
 *   },function(err,res) {
 *     expect(err).to.be.an.instanceof(Error);
 *     expect(res).to.not.be.ok();
 *   });
 *
 * @param {Array} [valueConfig] The values to cycle through for testing, defaults to null/empty/whitespace.
 * @param {string} [valueConfig[].desc] The description to used during `it` invocation.
 * @param {*} [valueConfig[].value] The value to use during the test.
 * @param {Array} argConfig An array of objects with `param`, `value` and `skip` properties.
 * @param {string} argConfig[].param Is the name of the parameter to use in the `it` description.
 * @param {*} argConfig[].value The good/proper value to use for the parameter.
 * @param {boolean} argConfig[].skip Setting to `true` will not test that argument for "NEWS"
 * @param {invokeCallback} cbInvoke This method is invoked with a single argv param for every test variation.
 * @param {expectCallback} [cbExpect] This method is invoked with all the arguments from the caller for every test variation.
 * 										Defaults to testing if the first arg is an Error object and
 * 										testing that a second argument is "not ok".
 */
function testArgs(valueConfig,argConfig,cbInvoke,cbExpect) {
	Array.prototype.slice.call(arguments,0).forEach(function(v,i,a) {
		// this whole block is just stupid
		// but it makes writing the test
		// much prettier and more intuitive
		// fashion over function I guess
		switch ( a.length ) {
			case 2:
				valueConfig = null;
				cbExpect = null;
				if ( i === 0 ) {
					argConfig = v;
				} else if ( i === 1 ) {
					cbInvoke = v;
				}
				break;
			case 3:
				if ( i === 0 ) {
					argConfig = v;
				} else if ( i === 1 ) {
					if ( typeof v === 'function' ) {
						cbInvoke = v;
						valueConfig = null;
					} else {
						argConfig = v;
						// leave valueConfig alone
						cbExpect = null;
					}
				} else if ( i === 2 ) {
					if ( typeof cbInvoke !== 'function' ) {
						cbInvoke = v;
					} else {
						cbExpect = v;
					}
				}
				break;
			case 4:
				// don't do anything, they already map to the signature
				break;
		}
	});

	if ( !Array.isArray(valueConfig) ) {
		valueConfig = [
			{ desc: 'null', value: null },
			{ desc: 'empty', value: '' },
			{ desc: 'whitespace', value: ' ' }
		];
	}

	if ( typeof cbExpect !== 'function' ) {
		cbExpect = function(err,arg2) {
			expect(err).to.be.an.instanceof(Error);
			expect(arg2).to.not.be.ok();
		};
	}

	valueConfig.forEach(function(testValue) {
		argConfig.forEach(function(testArg) {
			if ( testArg.skip ) {
				return;
			}
			var argv = l.map(argConfig,function(arg) {
				return arg === testArg ? testValue.value : arg.value;
			});
			var s = 'should fail with '+testValue.desc+' '+testArg.param;
			it(s,function(done) {
				argv.push(function() {
					var callerArguments = arguments;
					asyncCheck(done,function() {
						cbExpect.apply(null,callerArguments);
					});
				});
				cbInvoke(argv);
			});
		});
	});
}

module.exports = {
	asyncCheck: asyncCheck,
	expect: expect,
	lodash: l,
	noop: noop,
	readXML: readXML,
	testArgs: testArgs,
	xml2js: xml2js
};
