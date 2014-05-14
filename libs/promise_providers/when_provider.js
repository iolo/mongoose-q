var when = require('when');

function WhenPromiseProvider() {
    this.makePromise = function(callback) {
        var d = when.defer();
        callback(d.resolve, d.reject);
        return d.promise;
    };
}

module.exports = WhenPromiseProvider;
