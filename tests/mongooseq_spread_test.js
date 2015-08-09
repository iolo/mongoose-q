'use strict';

var
    assert = require('assert'),
    fixtures = require('./fixtures'),
    customMapper = function (name) {
        return 'spread' + name.charAt(0).toUpperCase() + name.substring(1);
    },
    // NOTE: with spread
    mongoose = require('../index')(require('mongoose'), {spread: true, mapper: customMapper}),
    schemas = require('./schemas'),
    UserModel = mongoose.model('User', schemas.UserSchema),
    PostModel = mongoose.model('Post', schemas.PostSchema),
    debug = require('debug')('test');

describe('mongooseq_with_spread', function () {
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
        UserModel.spreadCreate({name: 'hello spread'}, {name: 'world spread'})
            .spread(function (createdUser1, createdUser2) {
                debug('created users:', arguments);
                assert.equal(createdUser1.name, 'hello spread');
                // NOTE: you could get all result with 'spread' option
                assert.equal(createdUser2.name, 'world spread');
            })
            .catch(assert.ifError)
            .done(done);
    });
    // NOTE: since mongoose 4: no spread for update()!
    //it('should update', function (done) {
    //    this.timeout(86400);
    //    PostModel.spreadUpdate({_id: fixtures.posts.p1._id}, { title: 'changed'})
    //        .spread(function (raw) {
    //            debug('*********************************');
    //            debug('Model.update-->', arguments);
    //            assert.ok(raw);
    //            assert.equal(raw.ok, 1);
    //            assert.equal(raw.nModified, 1);
    //        })
    //        .catch(assert.ifError)
    //        .done(done);
    //});
    it('should save', function (done) {
        var post = new PostModel();
        post.__pre_save_called = false;
        post.__post_save_called = false;
        post.title = 'new-title';
        post.author = fixtures.users.u1._id;
        assert.ok(post.isNew);
        post.spreadSave()
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
                assert(post.__pre_save_called && post.__post_save_called);
                done();
            });
    });
});
