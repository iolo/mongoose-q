'use strict';

var
  apslice = Array.prototype.slice,
  debug = console.log.bind(console),
  DEBUG = !!process.env.MONGOOSEQ_DEBUG;

/**
 * @module mongooseq
 */

/**
 *
 * @param {object} obj
 * @param {Array.<string>} funcNames - original function names to apply Q
 * @param {function(string):string} funcNameMapper maps a function name into Q-applied one
 * @param {*} [spread=false] use spread for multi-results
 */
function qualify(qLib, obj, funcNames, funcNameMapper, spread) {
  funcNames.forEach(function (funcName) {
    if (typeof(obj[funcName]) !== 'function') {
      DEBUG && debug('***skip*** function not found:', funcName);
      return;
    }
    var mappedFuncName = funcNameMapper(funcName);
    DEBUG && debug('wrap function:', funcName, '-->', mappedFuncName);
    obj[mappedFuncName] = function () {
      var d = qLib.defer();
      var args = apslice.call(arguments);
      args.push(function (err, result) {
        if (err) {
          return d.reject(err);
        }
        // with 'spread' option: returns 'all' result with 'spread' only for multiple result
        if (spread && arguments.length > 2) {
          return d.resolve(apslice.call(arguments, 1));
        }
        // without 'spread' option: returns the 'first' result only and ignores following result
        return d.resolve(result);
      });
      // fix https://github.com/iolo/mongoose-q/issues/1
      // mongoose patches some instance methods after instantiation. :(
      this[funcName].apply(this, args);
      return d.promise;
    };
  });
}

/**
 * add Q wrappers for static/instance functions of mongoose model and query.
 *
 * @param {mongoose.Mongoose} [mongoose]
 * @param {object.<string,*>} [options={}] - prefix and/or suffix for wrappers
 * @param {object} [options.q] promise implementation(default: kriskowal's Q)
 * @param {string} [options.prefix='']
 * @param {string} [options.suffix='Q']
 * @param {function(string):string} [options.mapper]
 * @param {boolean} [options.spread=false] **DEPRECATED**
 * @param {object.<string,array<string>>} [options.funcNames=false]
 * @returns {mongoose.Mongoose} the same mongoose instance, for convenience
 */
function mongooseQ(mongoose, options) {
  mongoose = mongoose || require('mongoose');
  options = options || {};
  var prefix = options.prefix || '';
  var suffix = options.suffix || 'Q';
  var mapper = options.mapper || function (funcName) {
    return prefix + funcName + suffix;
  };
  var qLib = options.q || require('q');

  var spread = options.spread;
  var funcNames = options.funcNames || require('./func_names');
  // avoid duplicated application for custom mapper function...
  var applied = require('crypto').createHash('md5').update(prefix+suffix+mapper+spread).digest('hex');
  if (mongoose['__q_applied_' + applied]) {
    return mongoose;
  }

  qualify(qLib, mongoose.Model, funcNames.MODEL_STATICS, mapper, spread);
  qualify(qLib, mongoose.Model.prototype, funcNames.MODEL_METHODS, mapper, spread);
  qualify(qLib, mongoose.Query.prototype, funcNames.QUERY_METHODS, mapper, spread);
  qualify(qLib, mongoose.Aggregate.prototype, funcNames.AGGREGATE_METHODS, mapper, spread);

  mongoose['__q_applied_' + applied] = true;
  return mongoose;
}

module.exports = mongooseQ;
module.exports.qualify = qualify;
