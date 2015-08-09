mongoose-q
==========

>
> ![WANTED](http://web.redding.com/images/misc/wanted-responsive.png)
>
> ***WANTED: looking for new maintainer or contributor***
>
> please contact me via [email](mailto:iolothebard at gmail dot com) or [twitter](http://twitter.com/iolothebard)
>


[kriskowal's Q](http://documentup.com/kriskowal/q/) support for [mongoose](http://mongoosejs.com).

for [mongodb native nodejs driver](http://mongodb.github.io/node-mongodb-native/), see [mongo-q](http://github.com/iolo/mongo-q).

usage
-----

### to apply Q with default suffix 'Q':

```javascript
var mongoose = require('mongoose-q')(require('mongoose'));
// verbose way: mongooseQ is unused
var mongoose = require('mongoose'),
    mongooseQ = require('mongoose-q')(mongoose)
// shortest way: mongoose will be loaded by mongoose-q
var mongoose = require('mongoose-q')();
```

### to apply another Q implementation(since v0.0.15):

```javascript
// to use bluebird
var mongoose = require('mongoose-q')(require('mongoose'), {q:require('q-bluebird')});
```

### use Q-applied `model` statics:

```javascript
SomeModel.findByIdQ(....blahblah...)
  .then(function (result) { ... })
  .catch(function (err) { ... })
  .done();
```

### use Q-applied `model` methods:

```javascript
var someModel = new SomeModel(...);
someModel.populateQ()
  .then(function (result) { ... })
  .catch(function (err) { ... })
  .done();
```

### use Q-applied `query` methods:

```javascript
SomeModel.find(...).where(...).skip(...).limit(...).sort(...).populate(...)
  .execQ() // no 'Q' suffix for Query methods except for execQ()
  .then(function (result) { ... })
  .catch(function (err) { ... })
  .done();
```

### use Q-applied `aggregate` methods:

```javascript
SomeModel.aggregate(...).project(...).group(...).match(...).skip(...).limit(...).sort(...).unwind(...)
  .execQ() // no 'Q' suffix for Aggregate methods except for execQ()
  .then(function (result) { ... })
  .catch(function (err) { ... })
  .done();
```

### to apply Q with custom `suffix`/`prefix`:

```javascript
var mongoose = require('mongoose-q')(require('mongoose'), {prefix:'promiseOf_', suffix:'_withQ'});
SomeModel.promiseOf_findAndUpdate_withQ(...)
  .then(function (result) { ... })
  .catch(function (err) { ... })
  .done();
```

### to apply Q with custom name `mapper`:

```javascript
function customMapper(name) {
  return 'q' + name.charAt(0).toUpperCase() + name.substring(1);
}
var mongoose = require('mongoose-q')(require('mongoose'), {mapper:customMapper});
SomeModel.qFindAndUpdate(...)
  .then(function (result) { ... })
  .catch(function (err) { ... })
  .done();
```

### **DEPRECATED** to apply Q with `spread`:

> NOTE: since mongoose 4.x: no spread for update()!

> NOTE: without `spread` option(by default), you can access only the first result with `then`!!

```javascript
var mongoose = require('mongoose-q')(require('mongoose'), {spread:true});
SomeModel.createQ(doc1, doc2, ...)
  .spread(function (saved1, saved2, ...) { ... })
  .catch(function (err) { ... })
  .done();
SomeModel.createQ(doc1, doc2, ...)
  .then(function (result) { var saved1 = result[0], raw = saved1[1]; ... })
  .catch(function (err) { ... })
  .done();
...
var model = new SomeModel();
...
model.saveQ()
  .spread(function (savedDoc, affectedRows) { ... })
  .catch(function (err) { ... })
  .done();
...
model.saveQ()
  .then(function (result) { var savedDoc = result[0], affectedRows = result[1]; ... })
  .catch(function (err) { ... })
  .done();
```

### to define custom statics/instance methods using Q

> NOTE: this is not a feature of mongoose-q

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

That's all folks!
