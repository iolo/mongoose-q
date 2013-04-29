'use strict';

var
  fixtures = require('./fixtures'),
  mongoose = require('../libs/mongoose_q')(require('mongoose')),
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
      test.equal(typeof UserModel[funcName + 'Q'], 'function');
    });
    test.done();
  },
  test_modelMethods: function (test) {
    var model = new UserModel();
    MONGOOSE_MODEL_METHODS.forEach(function (funcName) {
      console.log(funcName);
      test.equal(typeof model[funcName + 'Q'], 'function');
    });
    test.done();
  },
  test_queryInstances: function (test) {
    var query = UserModel.find();
    MONGOOSE_QUERY_METHODS.forEach(function (funcName) {
      console.log(funcName);
      test.equal(typeof query[funcName + 'Q'], 'function');
    });
    test.done();
  },
  test_findById__and__populate: function (test) {
    PostModel.findByIdQ(fixtures.posts.p1._id)
      .then(function (result) {
        console.log('Model.findById-->', result);
        test.ok(result);
        return result.populateQ('author');
      })
      .then(function (result) {
        console.log('Model#populate-->', result);
        test.ok(result);
      })
      .fail(test.ifError)
      .done(test.done);
  },
  test_findById__and__exec: function (test) {
    PostModel.findById(fixtures.posts.p1._id).execQ()
      .then(function (result) {
        console.log('Model.findById and Query#exec-->', result);
        test.ok(result);
      })
      .fail(test.ifError)
      .done(test.done);
  }
};
