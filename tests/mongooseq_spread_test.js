'use strict';

var
    assert = require('assert'),
    fixtures = require('./fixtures'),
    customMapper = function (name) {
        return 'q' + name.charAt(0).toUpperCase() + name.substring(1);
    },
    // NOTE: with spread
    mongoose = require('../index')(require('mongoose'), {spread: true, mapper: customMapper}),
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
        'findOneAndUpdate', 'findOneAndRemove', 'lean', 'limit', 'skip', 'sort'
    ],
    MONGOOSE_AGGREGATE_METHODS = [
        'exec'
    ],
    debug = console.log.bind(console);

PostSchema.plugin(function (schema) {
    schema.pre('save', function (next) {
        debug('*** pre save', this);
        PostSchema.__pre_save_called = true;
        next();
    });
    schema.post('save', function (doc) {
        debug('*** post save', doc);
        PostSchema.__post_save_called = true;
    });
}, {});

PostModel = mongoose.model('Post', PostSchema);

describe('mongooseq', function () {
    beforeEach(function (done) {
        var fixturesLoader = require('pow-mongodb-fixtures').connect('test');
        fixturesLoader.clearAndLoad(fixtures, function (err) {
            if (err) throw err;
            fixturesLoader.client.close();
            mongoose.connect('mongodb://localhost/test');
            done();
        });
    });
    afterEach(function (done) {
        mongoose.disconnect();
        done();
    });
    it('should create', function (done) {
        UserModel.qCreate({name: 'hello spread'}, {name: 'world spread'})
            .spread(function (createdUser1, createdUser2) {
                debug('created users:', arguments);
                assert.equal(createdUser1.name, 'hello spread');
                // NOTE: you could get all result with 'spread' option
                assert.equal(createdUser2.name, 'world spread');
            })
            .catch(assert.ifError)
            .done(done);
    });
    it('should update', function (done) {
        PostModel.qUpdate({_id: fixtures.posts.p1._id}, { title: 'changed'})
            .spread(function (affectedRows, raw) {
                debug('Model.update-->', arguments);
                assert.equal(affectedRows, 1);
                // NOTE: you could get all result with 'spread' option
                assert.ok(raw);
            })
            .catch(assert.ifError)
            .done(done);
    });
    it('should save', function (done) {
        PostSchema.__pre_save_called = false;
        PostSchema.__post_save_called = false;
        var post = new PostModel();
        post.title = 'new-title';
        post.author = fixtures.users.u1._id;
        assert.ok(post.isNew);
        post.qSave()
            .spread(function (result, affectedRows) {// with 'spread' options
                debug('Model#save-->', arguments);
                assert.ok(result);
                assert.ok(!result.isNew);
                assert.ok(result._id);
                assert.equal(result.title, 'new-title');
                assert.equal(result.author.toString(), fixtures.users.u1._id.toString());
                // NOTE: you could get all result with 'spread option
                assert.equal(affectedRows, 1);
            })
            .catch(assert.ifError)
            .done(function () {
                assert(PostSchema.__pre_save_called && PostSchema.__post_save_called);
                done();
            });
    });
});
