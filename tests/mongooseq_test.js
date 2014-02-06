'use strict';

var
  Q = require('q'),
  fixtures = require('./fixtures'),
  customMapper = function (name) {
    return 'q' + name.charAt(0).toUpperCase() + name.substring(1);
  },
  mongoose = require('../libs/mongoose_q')(require('mongoose'), {spread: true, mapper: customMapper}),
  Schema = mongoose.Schema,
  UserSchema = new Schema({
    name: String
  }),
  UserModel = mongoose.model('User', UserSchema),
  PostSchema = new Schema({
    title: String,
    author: {type: Schema.Types.ObjectId, ref: 'User'}
  }),
  PostModel,
  MONGOOSE_MODEL_STATICS = [
    // mongoose.Model static
    'remove', 'ensureIndexes', 'find', 'findById', 'findOne', 'count', 'distinct',
    'findOneAndUpdate', 'findByIdAndUpdate', 'findOneAndRemove', 'findByIdAndRemove',
    'create', 'update', 'mapReduce', 'aggregate', 'populate',
    // mongoose.Document static
    'update'
  ],
  MONGOOSE_MODEL_METHODS = [
    // mongoose.Model instance
    'save', 'remove',
    // mongoose.Document instance
    'populate', 'update', 'validate'
  ],
  MONGOOSE_QUERY_METHODS = [
    // mongoose.Query instance
    'find', 'exec', 'findOne', 'count', 'distinct', 'update', 'remove',
    'findOneAndUpdate', 'findOneAndRemove'
  ];

PostSchema.plugin(function (schema) {
  schema.pre('save', function (next) {
    console.log('*** pre save', this);
    schema.__test.ok(true);
    next();
  });
  schema.post('save', function (doc) {
    console.log('*** post save', doc);
    schema.__test.ok(doc);
  });
}, {});

PostModel = mongoose.model('Post', PostSchema);

module.exports = {
  setUp: function (callback) {
    var fixturesLoader = require('pow-mongodb-fixtures').connect('test');
    fixturesLoader.clearAndLoad(fixtures, function (err) {
      if (err) throw err;
      fixturesLoader.client.close();
      mongoose.connect('mongodb://localhost/test');
      callback();
    });
  },
  tearDown: function (callback) {
    mongoose.disconnect();
    callback();
  },
  test_modelStatics: function (test) {
    MONGOOSE_MODEL_STATICS.forEach(function (funcName) {
      console.log(funcName);
      test.equal(typeof UserModel[customMapper(funcName)], 'function');
    });
    test.done();
  },
  test_modelMethods: function (test) {
    var model = new UserModel();
    MONGOOSE_MODEL_METHODS.forEach(function (funcName) {
      console.log(funcName);
      test.equal(typeof model[customMapper(funcName)], 'function');
    });
    test.done();
  },
  test_queryInstances: function (test) {
    var query = UserModel.find();
    MONGOOSE_QUERY_METHODS.forEach(function (funcName) {
      console.log(funcName);
      test.equal(typeof query[customMapper(funcName)], 'function');
    });
    test.done();
  },
  test_findById__and__populate: function (test) {
    PostSchema.__test = test;
    PostModel.qFindById(fixtures.posts.p1._id)
      .then(function (result) {
        console.log('Model.findById-->', result);
        test.ok(result);
        return result.qPopulate('author');
      })
      .then(function (result) {
        console.log('Model#populate-->', result);
        test.ok(result);
      })
      .fail(test.ifError)
      .done(test.done);
  },
  test_findById__and__exec: function (test) {
    PostSchema.__test = test;
    PostModel.findById(fixtures.posts.p1._id).qExec()
      .then(function (result) {
        console.log('Model.findById and Query#exec-->', result);
        test.ok(result);
      })
      .fail(test.ifError)
      .done(test.done);
  },
  test_update_spread: function (test) {
    PostSchema.__test = test;
    PostModel.qUpdate({_id: fixtures.posts.p1._id}, { title: 'changed'})
      .spread(function (affectedRows, raw) {
        console.log('Model.update-->', arguments);
        test.equal(affectedRows, 1);
        test.ok(raw);
      })
      .fail(test.ifError)
      .done(test.done);
  },
  test_save: function (test) {
    PostSchema.__test = test;
    var post = new PostModel();
    post.title = 'new-title';
    post.author = fixtures.users.u1._id;
    test.ok(post.isNew);
// this works!
//    post.save(function (err, result, affectedRows) {// with 'spread' options
//      test.ifError(err);
//      console.log('Model#save-->', arguments);
//      test.ok(result);
//      test.equal(affectedRows, 1);
//      test.ok(!result.isNew);
//      test.ok(result._id);
//      test.equal(result.title, 'new-title');
//      test.equal(result.author.toString(), fixtures.users.u1._id.toString());
//      test.done();
//    });
// this works!
//    Q.ninvoke(post, 'save')
    post.qSave()
      .spread(function (result, affectedRows) {// with 'spread' options
        console.log('Model#save-->', arguments);
        test.ok(result);
        test.equal(affectedRows, 1);
        test.ok(!result.isNew);
        test.ok(result._id);
        test.equal(result.title, 'new-title');
        test.equal(result.author.toString(), fixtures.users.u1._id.toString());
      })
      .fail(test.ifError)
      .done(test.done);
  },
  test_issue2: function (test) {
    UserModel.qFindById(fixtures.users.u1._id)
      .then(function (user) {
        return [ user, PostModel.find().populate('author').qExec() ];
      })
      .spread(function (user, users) {
        console.log('user:', user);
        console.log('users:', users);
        test.ok(user);
        test.ok(users);
      })
      .fail(function (err) {
        console.log(err);
        test.ifError(err);
      })
      .done(test.done);
  }
};
