mongoose-q
==========

[kriskowal's Q](http://documentup.com/kriskowal/q/) support for [mongoose](http://mongoosejs.com).

for [mongodb native nodejs driver](http://mongodb.github.io/node-mongodb-native/), see [mongo-q](http://github.com/iolo/mongo-q).

usage
-----

* to apply Q with default suffix 'Q':

```javascript
var mongoose = require('mongoose-q')(require('mongoose'));
// verbose way: mongooseQ is unused
var mongoose = require('mongoose'),
    mongooseQ = require('mongoose-q')(mongoose)
// shortest way: mongoose will be loaded by mongoose-q
var mongoose = require('mongoose-q')();
```

* use Q-applied `model` statics:

```javascript
SomeModel.findByIdQ(....blahblah...)
  .then(function (result) { ... })
  .fail(function (err) { ... })
  .done();
```

* use Q-applied `model` methods:

```javascript
var someModel = new SomeModel(...);
someModel.populateQ()
  .then(function (result) { ... })
  .fail(function (err) { ... })
  .done();
```

* use Q-applied `query` methods:

```javascript
SomeModel.find(...).where(...).skip(...).limit(...).sort(...).populate(...)
  .execQ() // no 'Q' suffix for model statics except for execQ()
  .then(function (result) { ... })
  .fail(function (err) { ... })
  .done();
```

* to apply Q with custom `suffix`/`prefix`:

```javascript
var mongoose = require('mongoose-q')(require('mongoose'), {prefix:'promiseOf_', suffix:'_withQ'});
SomeModel.promiseOf_findAndUpdate_withQ(...)
  .then(function (result) { ... })
  .fail(function (err) { ... })
  .done();
```

* to apply Q with custom name `mapper`:

```javascript
function customMapper(name) {
  return 'q' + name.charAt(0).toUpperCase() + name.substring(1);
}
var mongoose = require('mongoose-q')(require('mongoose'), {mapper:customMapper});
SomeModel.qFindAndUpdate(...)
  .then(function (result) { ... })
  .fail(function (err) { ... })
  .done();
```

* to apply Q with `spread`:

```javascript
var mongoose = require('mongoose-q')(require('mongoose'), {spread:true});
SomeModel.updateQ(...)
  .spread(function (affectedRows, raw) { ... })
  .fail(function (err) { ... })
  .done();
SomeModel.updateQ(...)
  .then(function (result) { var affectedRows = result[0], raw = result[1]; ... })
  .fail(function (err) { ... })
  .done();
...
var model = new SomeModel();
...
model.saveQ()
  .spread(function (savedDoc, affectedRows) { ... })
  .fail(function (err) { ... })
  .done();
...
model.saveQ()
  .then(function (result) { var savedDoc = result[0], affectedRows = result[1]; ... })
  .fail(function (err) { ... })
  .done();
```
> NOTE: without `spread` option(by default), you can access only the first result with `then`!!

* to define custom statics/instance methods using Q

```javascript
SomeSchema.statics.findByName = function (name) {
  return this.findQ({name: name}); // NOTE: returns Promise object.
};
...
var SomeModel = mongoose.model('Some', SomeSchema);
SomeModel.findByName('foo').then(function(result) {
  console.log(result);
});
```
> NOTE: this is not a feature of mongoose-q

That's all folks!
