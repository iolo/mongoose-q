'use strict';
var customMapper = function (name) {
    return 'when' + name.charAt(0).toUpperCase() + name.substring(1);
};

var commonTests = require('./common_tests');
var WhenProvider = require('../lib/promise_providers/when');
var mongoose = require('mongoose');
var mongooseQ = require('../lib')(mongoose, {
    spread: true,
    mapper: customMapper,
    promiseProvider: new WhenProvider()
});
commonTests.makeTests(module.exports, 'Q', mongooseQ, 'catch', customMapper);