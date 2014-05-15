var Promise = require('bluebird');

function BluebirdPromiseProvider() {
  this.makePromise = function(callback) {
    return new Promise(callback);
  };
}

module.exports = BluebirdPromiseProvider;
