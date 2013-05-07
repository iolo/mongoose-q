'use strict';

var
  Q = require('q'),
  MONGOOSE_MODEL_STATICS = [
    // mongoose.Model static
    'remove', 'ensureIndexes', 'find', 'findById', 'findOne', 'count', 'distinct',
    'findOneAndUpdate', 'findByIdAndUpdate', 'findOneAndRemove', 'findByIdAndRemove',
    'create', 'update', 'mapReduce', 'aggregate', 'populate',
    // mongoose.Document static
    'update'
  ],
  MONGOOSE_MODEL_METHODS = [
    // mongoose.Model instance
    'save', 'remove',
    // mongoose.Document instance
    'populate'
  ],
  MONGOOSE_QUERY_METHODS = [
    // mongoose.Query instance
    'find', 'exec', 'findOne', 'count', 'distinct', 'update', 'remove',
    'findOneAndUpdate', 'findOneAndRemove'
  ],
  apslice = Array.prototype.slice;

/**
 * @module mongooseq
 */
;

/**
 * @callback MapperCallback
 * @param {string} name the original function name to apply Q
 * @returns {string} Q-applied function name
 */
;

/**
 * @typedef {object} Options
 * @property {string} prefix
 * @property {string} suffix
 * @property {MapperCallback} mapper
 * @property {boolean} spread
 */
;

/**
 *
 * @param {object} obj
 * @param {Array.<string>} funcNames - original function names to apply Q
 * @param {MapperCallback} funcNameMapper maps a function name into Q-applied one
 * @param {boolean} [spread=false] use spread for multi-results
 */
function qualify(obj, funcNames, funcNameMapper, spread) {
  funcNames.forEach(function (funcName) {
    var func = obj[funcName];
    if (typeof(func) !== 'function') return;
    obj[funcNameMapper(funcName)] = function () {
      var d = Q.defer();
      var args = apslice.call(arguments);
      args.push(function (err, result) {
        if (err) {
          return d.reject(err);
        }
        if (spread && arguments.length > 2) {
          return d.resolve(apslice.call(arguments, 1));
        }
        return d.resolve(result);
      });
      func.apply(this, args);
      return d.promise;
    };
  });
}

/**
 * add Q wrappers for static/instance functions of mongoose model and query.
 *
 * @param {mongoose.Mongoose} [mongoose]
 * @param {Options} [options] prefix and/or suffix for wrappers
 * @returns {mongoose.Mongoose} the same mongoose instance, for convenince
 */
function mongooseQ(mongoose, options) {
  var mongoose = mongoose || require('mongoose');
  var prefix = options && options.prefix || '';
  var suffix = options && options.suffix || 'Q';
  var mapper = options && options.mapper || function (funcName) {
    return prefix + funcName + suffix;
  };
  var spread = options && options.spread;
  // avoid duplicated application for custom mapper function...
  var applied = require('crypto').createHash('md5').update(mapper.toString()).digest('hex');
  if (mongoose['__q_applied_' + applied]) {
    return mongoose;
  }

  qualify(mongoose.Model, MONGOOSE_MODEL_STATICS, mapper, spread);
  qualify(mongoose.Model.prototype, MONGOOSE_MODEL_METHODS, mapper, spread);
  qualify(mongoose.Query.prototype, MONGOOSE_QUERY_METHODS, mapper, spread);

  mongoose['__q_applied_' + applied] = true;
  return mongoose;
}

module.exports = mongooseQ;
module.exports.qualify = qualify;
