'use strict';

var
    assert = require('assert'),
    fixtures = require('./fixtures'),
    customMapper = function (name) {
        return 'q' + name.charAt(0).toUpperCase() + name.substring(1);
    },
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
    it('should wrap model statics', function () {
        MONGOOSE_MODEL_STATICS.forEach(function (funcName) {
            debug(funcName);
            assert(typeof UserModel[customMapper(funcName)] === 'function');
        });
    });
    it('should wrap model methods', function () {
        var model = new UserModel();
        MONGOOSE_MODEL_METHODS.forEach(function (funcName) {
            debug(funcName);
            assert(typeof model[customMapper(funcName)] === 'function');
        });
    });
    it('should wrap query methods', function () {
        var query = UserModel.find();
        MONGOOSE_QUERY_METHODS.forEach(function (funcName) {
            debug(funcName);
            assert(typeof query[customMapper(funcName)] === 'function');
        });
    });
    it('should wrap aggregate methods', function () {
        var aggregate = UserModel.aggregate();
        MONGOOSE_AGGREGATE_METHODS.forEach(function (funcName) {
            debug(funcName);
            assert(typeof aggregate[customMapper(funcName)] === 'function');
        });
    });
    it('should findById and populate', function (done) {
        PostModel.qFindById(fixtures.posts.p1._id)
            .then(function (result) {
                debug('Model.findById-->', result);
                assert.ok(result);
                return result.qPopulate('author');
            })
            .then(function (result) {
                debug('Model#populate-->', result);
                assert.ok(result);
            })
            .catch(assert.ifError)
            .done(done);
    });
    it('should findById__and__exec', function (done) {
        PostModel.findById(fixtures.posts.p1._id).qExec()
            .then(function (result) {
                debug('Model.findById and Query#exec-->', result);
                assert.ok(result);
            })
            .catch(assert.ifError)
            .done(done);
    });
    it('should create', function (done) {
        UserModel.qCreate({name: 'hello'}, {name: 'world'})
            .then(function (createdUsers) {
                debug('created users:', arguments);
                assert.equal(createdUsers.length, 2);
                assert.equal(createdUsers[0].name, 'hello');
                assert.equal(createdUsers[1].name, 'world');
            })
            .catch(assert.ifError)
            .done(done);
    });
    it('should create with spread', function (done) {
        UserModel.qCreate({name: 'hello spread'}, {name: 'world spread'})
            .spread(function (createdUser1, createdUser2) {
                debug('created users:', arguments);
                assert.equal(createdUser1.name, 'hello spread');
                assert.equal(createdUser2.name, 'world spread');
            })
            .catch(assert.ifError)
            .done(done);
    });
    it('should update with spread', function (done) {
        PostModel.qUpdate({_id: fixtures.posts.p1._id}, { title: 'changed'})
            .spread(function (affectedRows, raw) {
                debug('Model.update-->', arguments);
                assert.equal(affectedRows, 1);
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
                assert.equal(affectedRows, 1);
                assert.ok(!result.isNew);
                assert.ok(result._id);
                assert.equal(result.title, 'new-title');
                assert.equal(result.author.toString(), fixtures.users.u1._id.toString());
            })
            .catch(assert.ifError)
            .done(function () {
                assert(PostSchema.__pre_save_called && PostSchema.__post_save_called);
                done();
            });
    });
    it('should aggregate', function (done) {
        // fix issue6
        var agg = UserModel.aggregate();
        console.log('****************', agg);
        agg
            .match({name: {$regex: '^b.*' }})
            .qExec()
            .then(function (result) {
                debug('result:', result);
                assert.ok(result);
            })
            .catch(assert.ifError)
            .done(done);
    });
    it('should assert issue2', function (done) {
        UserModel.qFindById(fixtures.users.u1._id)
            .then(function (user) {
                return [ user, PostModel.find().populate('author').qExec() ];
            })
            .spread(function (user, users) {
                debug('user:', user);
                debug('users:', users);
                assert.ok(user);
                assert.ok(users);
            })
            .catch(assert.ifError)
            .done(done);
    });
});
