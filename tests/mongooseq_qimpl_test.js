'use strict';
var customMapper = function (name) {
    return 'q' + name.charAt(0).toUpperCase() + name.substring(1);
};

var commonTests = require('./common_tests', customMapper);
var QProvider = require('../lib/promise_providers/q_provider');
var mongoose = require('mongoose');
var mongooseQ = require('../lib')(mongoose, {
    spread: true,
    mapper: customMapper,
    promiseProvider: new QProvider()
});
commonTests.makeTests(module.exports, 'Q', mongooseQ, 'fail', customMapper);