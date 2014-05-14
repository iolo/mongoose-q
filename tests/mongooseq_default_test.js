'use strict';
var customMapper = function (name) {
return 'qDefault' + name.charAt(0).toUpperCase() + name.substring(1);
};

var commonTests = require('./common_tests', customMapper);
var QProvider = require('../lib/promise_providers/q');
var mongoose = require('mongoose');
var mongooseQ = require('../lib')(mongoose, {
  spread: true,
  mapper: customMapper
});
commonTests.makeTests(module.exports, 'Q', mongooseQ, 'fail', customMapper);