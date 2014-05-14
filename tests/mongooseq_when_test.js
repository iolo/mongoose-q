'use strict';
var customMapper = function (name) {
    return 'when' + name.charAt(0).toUpperCase() + name.substring(1);
};

var commonTests = require('./common_tests');
var WhenProvider = require('../libs/promise_providers/when_provider');
var mongoose = require('mongoose');
var mongooseQ = require('../libs/mongoose_q')(mongoose, {
    spread: true,
    mapper: customMapper,
    promiseProvider: new WhenProvider()
});
commonTests.makeTests(module.exports, 'Q', mongooseQ, 'catch', customMapper);