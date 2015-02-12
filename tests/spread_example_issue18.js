// try this too
// var mongoose = require('./index')();
var mongoose = require('..')(require('mongoose'),{spread:true});

mongoose.connect('mongodb://localhost/test');

var Tank = mongoose.model('Tank', new mongoose.Schema({ name: 'string', size: 'string'}));

var small = new Tank({size: 'small'});
small.saveQ().then(function(x,y){console.log('small with then', 'x=',x,'y=',y);}).done();

var large = new Tank({size: 'large'});
large.saveQ().spread(function(x,y){console.log('large with spread', 'x=',x,'y=',y);}).done();
