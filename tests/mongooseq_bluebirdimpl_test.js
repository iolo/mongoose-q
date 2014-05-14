'use strict';
var customMapper = function (name) {
    return 'bb' + name.charAt(0).toUpperCase() + name.substring(1);
};

var commonTests = require('./common_tests');
var BluebirdProvider = require('../lib/promise_providers/bluebird_provider');
var mongoose = require('mongoose');
var mongooseQ = require('../lib')(mongoose, {
    spread: true,
    mapper: customMapper,
    promiseProvider: new BluebirdProvider()
});
commonTests.makeTests(module.exports, 'Q', mongooseQ, 'catch', customMapper);