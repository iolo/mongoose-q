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
 *
 * @param obj
 * @param funcNames
 * @param prefix
 * @param suffix
 */
function qualify(obj, funcNames, prefix, suffix) {
  funcNames.forEach(function (funcName) {
    var func = obj[funcName];
    if (typeof(func) !== 'function') return;
    obj[prefix + funcName + suffix] = function () {
      var d = Q.defer();
      var args = apslice.call(arguments);
      args.push(d.makeNodeResolver());
      func.apply(this, args);
      return d.promise;
    };
  });
}

/**
 * add Q wrappers for static/instance functions of mongoose model and query.
 *
 * @param {mongoose.Mongoose} [mongoose]
 * @param {Object} [options] prefix and/or suffix for wrappers
 * @returns {mongoose.Mongoose} the same mongoose instance, for convenince
 */
function mongooseQ(mongoose, options) {
  var mongoose = mongoose || require('mongoose');
  var prefix = options && options.prefix || '';
  var suffix = options && options.suffix || 'Q';
  if (mongoose['__q_applied_' + prefix + suffix]) { return mongoose; }

  qualify(mongoose.Model, MONGOOSE_MODEL_STATICS, prefix, suffix);
  qualify(mongoose.Model.prototype, MONGOOSE_MODEL_METHODS, prefix, suffix);
  qualify(mongoose.Query.prototype, MONGOOSE_QUERY_METHODS, prefix, suffix);

  mongoose['__q_applied_' + prefix + suffix] = true;
  return mongoose;
}

module.exports = mongooseQ;
module.exports.qualify = qualify;
