'use strict';

var
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
  PostModel = mongoose.model('Post', PostSchema),
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
    'populate'
  ],
  MONGOOSE_QUERY_METHODS = [
    // mongoose.Query instance
    'find', 'exec', 'findOne', 'count', 'distinct', 'update', 'remove',
    'findOneAndUpdate', 'findOneAndRemove'
  ];

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
    PostModel.findById(fixtures.posts.p1._id).qExec()
      .then(function (result) {
        console.log('Model.findById and Query#exec-->', result);
        test.ok(result);
      })
      .fail(test.ifError)
      .done(test.done);
  },
  test_update_spread: function (test) {
    PostModel.qUpdate({_id: fixtures.posts.p1._id}, { title: 'changed'})
      .spread(function (affectedRows, raw) {
        console.log('Model.update-->', arguments);
        test.equal(affectedRows, 1);
        test.ok(raw);
      })
      .fail(test.ifError)
      .done(test.done);
  }
};
