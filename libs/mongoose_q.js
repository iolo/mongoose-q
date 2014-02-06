'use strict';

var
  Q = require('q'),
  MONGOOSE_MODEL_STATICS = [
    // mongoose.Model static
    'remove', 'ensureIndexes', 'find', 'findById', 'findOne', 'count', 'distinct',
    'findOneAndUpdate', 'findByIdAndUpdate', 'findOneAndRemove', 'findByIdAndRemove',
    'create', 'update', 'mapReduce', 'aggregate', 'populate',
    'geoNear', 'geoSearch',
    // mongoose.Document static
    'update'
  ],
  MONGOOSE_MODEL_METHODS = [
    // mongoose.Model instance
    'save', 'remove',
    // mongoose.Document instance
    'populate', 'update', 'validate'
  ],
  MONGOOSE_QUERY_METHODS = [
    // mongoose.Query instance
    'find', 'exec', 'findOne', 'count', 'distinct', 'update', 'remove',
    'findOneAndUpdate', 'findOneAndRemove'
  ],
  //MONGOOSE_AGGREGATE_METHODS = [
  //  'exec'
  //],
  apslice = Array.prototype.slice,
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
function qualify(obj, funcNames, funcNameMapper, spread) {
  DEBUG && console.log('wrap obj:', obj);
  funcNames.forEach(function (funcName) {
    if (typeof(obj[funcName]) !== 'function') {
      DEBUG && console.warn('***skip*** function not found:', funcName);
      return;
    }
    var mappedFuncName = funcNameMapper(funcName);
    DEBUG && console.log('wrap function:', funcName, '-->', mappedFuncName);
    obj[mappedFuncName] = function () {
      var d = Q.defer();
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
 * @param {string} [options.prefix='']
 * @param {string} [options.suffix='']
 * @param {function(string):string} [options.mapper]
 * @param {boolean} [options.spread=false]
 * @returns {mongoose.Mongoose} the same mongoose instance, for convenince
 */
function mongooseQ(mongoose, options) {
  mongoose = mongoose || require('mongoose');
  options = options || {};
  var prefix = options.prefix || '';
  var suffix = options.suffix || 'Q';
  var mapper = options.mapper || function (funcName) {
    return prefix + funcName + suffix;
  };
  var spread = options.spread;
  // avoid duplicated application for custom mapper function...
  var applied = require('crypto').createHash('md5').update(mapper.toString()).digest('hex');
  if (mongoose['__q_applied_' + applied]) {
    return mongoose;
  }

  qualify(mongoose.Model, MONGOOSE_MODEL_STATICS, mapper, spread);
  qualify(mongoose.Model.prototype, MONGOOSE_MODEL_METHODS, mapper, spread);
  qualify(mongoose.Query.prototype, MONGOOSE_QUERY_METHODS, mapper, spread);

  //qualify(Aggregate.prototype, AGGREGATE_METHODS, mapper, spread);

  mongoose['__q_applied_' + applied] = true;
  return mongoose;
}

module.exports = mongooseQ;
module.exports.qualify = qualify;
