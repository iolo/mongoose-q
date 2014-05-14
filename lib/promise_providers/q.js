var Q = require('q');

function QPromiseProvider() {
  this.makePromise = function(callback) {
    var d = Q.defer();
    callback(d.resolve, d.reject);
    return d.promise;
  };
}

module.exports = QPromiseProvider;
