'use strict';

var
    assert = require('assert'),
    fixtures = require('./fixtures'),
    customMapper = function (name) {
        return 'q' + name.charAt(0).toUpperCase() + name.substring(1);
    },
    // NOTE: without spread option!
    mongoose = require('../index')(require('mongoose'), {mapper: customMapper}),
    funcNames = require('../func_names'),
    schemas = require('./schemas'),
    UserModel = mongoose.model('User', schemas.UserSchema),
    PostModel = mongoose.model('Post', schemas.PostSchema),
    debug = require('debug')('test');

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
        funcNames.MODEL_STATICS.forEach(function (funcName) {
            debug(funcName);
            assert(typeof UserModel[customMapper(funcName)] === 'function');
        });
    });
    it('should wrap model methods', function () {
        var model = new UserModel();
        funcNames.MODEL_METHODS.forEach(function (funcName) {
            debug(funcName);
            assert(typeof model[customMapper(funcName)] === 'function');
        });
    });
    it('should wrap query methods', function () {
        var query = UserModel.find();
        funcNames.QUERY_METHODS.forEach(function (funcName) {
            debug(funcName);
            assert(typeof query[customMapper(funcName)] === 'function');
        });
    });
    it('should wrap aggregate methods', function () {
        var aggregate = UserModel.aggregate();
        funcNames.AGGREGATE_METHODS.forEach(function (funcName) {
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
                assert.ok(result.author._id);
                assert.ok(result.author.name);
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
            .then(function (createdUser1, createdUser2) {
                debug('Model.create:', arguments);
                assert.equal(createdUser1.name, 'hello');
                // NOTE: you couldn't get remaing result without 'spread' option!
                assert.ok(typeof createdUser2 === 'undefined');
            })
            .catch(assert.ifError)
            .done(done);
    });
    // NOTE: since mongoose 4.x: update only returns a result - raw mongo result.
    it('should update', function (done) {
        PostModel.qUpdate({_id: fixtures.posts.p1._id}, { title: 'changed'})
            .then(function (raw) {
                debug('Model.update:', arguments);
                assert.ok(raw);
                assert.equal(raw.ok, 1);
                assert.equal(raw.nModified, 1);
            })
            .catch(assert.ifError)
            .done(done);
    });
    it('should save', function (done) {
        var post = new PostModel();
        post.__pre_save_called = false;
        post.__post_save_called = false;
        post.title = 'new-title';
        post.author = fixtures.users.u1._id;
        assert.ok(post.isNew);
        post.qSave()
            .then(function (result, affectedRows) {
                debug('Model#save-->', arguments);
                assert.ok(result);
                assert.ok(!result.isNew);
                assert.ok(result._id);
                assert.equal(result.title, 'new-title');
                assert.equal(result.author.toString(), fixtures.users.u1._id.toString());
                // NOTE: you couldn't get remaining result without 'spread' option!
                assert.ok(typeof affectedRows === 'undefined');
            })
            .catch(assert.ifError)
            .done(function () {
                assert(post.__pre_save_called && post.__post_save_called);
                done();
            });
    });
    it('should aggregate', function (done) {
        // fix issue6
        var agg = UserModel.aggregate();
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
    it('should assert issue22', function (done) {
        PostModel.qFindById(fixtures.posts.p1._id)
            .then(function (result) {
                debug('Model.findById-->', result);
                assert.ok(result);
                return result.qPopulate([
                    {path:'author'},
                    {path:'comments.author'}
                ]);
            })
            .then(function (result) {
                debug('Model#populate author-->', result.author);
                assert.ok(result);
                assert.ok(result.author._id);
                assert.ok(result.author.name);
                result.comments.forEach(function (comment) {
                    debug('Model#populate comments.author-->', comment.author);
                    assert.ok(comment.author._id);
                    assert.ok(comment.author.name);
                });
            })
            .catch(assert.ifError)
            .done(done);
    });
});
