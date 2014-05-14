'use strict';

// Model classes can only be defined once in Mongoose
var schemasMade = false;
var UserSchema = null;
var UserModel = null;
var PostSchema = null;
var PostModel = null;

var makeSchemas = function(mongoose) {
    if (!schemasMade) {
        var Schema = mongoose.Schema;
        UserSchema = new Schema({
            name: String
        });
        UserModel = mongoose.model('User', UserSchema);

        PostSchema = new Schema({
            title: String,
            author: {type: Schema.Types.ObjectId, ref: 'User'}
        });
        PostSchema.plugin(function (schema) {
            schema.pre('save', function (next) {
                //console.log('*** pre save', this);
                schema.__test.ok(true);
                next();
            });
            schema.post('save', function (doc) {
                //console.log('*** post save', doc);
                schema.__test.ok(doc);
            });
        }, {});
        PostModel = mongoose.model('Post', PostSchema);
        schemasMade = true;
    }
};

module.exports = {
    makeTests: function (exports, implName, mongoose, catchName, customMapper) {
        var fixtures = require('./fixtures');
        makeSchemas(mongoose);

        var MONGOOSE_MODEL_STATICS = [
            // mongoose.Model static
            'remove', 'ensureIndexes', 'find', 'findById', 'findOne', 'count', 'distinct',
            'findOneAndUpdate', 'findByIdAndUpdate', 'findOneAndRemove', 'findByIdAndRemove',
            'create', 'update', 'mapReduce', 'aggregate', 'populate',
            // mongoose.Document static
            'update'
        ];
        var MONGOOSE_MODEL_METHODS = [
            // mongoose.Model instance
            'save', 'remove',
            // mongoose.Document instance
            'populate', 'update', 'validate'
        ];
        var MONGOOSE_QUERY_METHODS = [
            // mongoose.Query instance
            'find', 'exec', 'findOne', 'count', 'distinct', 'update', 'remove',
            'findOneAndUpdate', 'findOneAndRemove', 'lean', 'limit', 'skip', 'sort'
        ];
        var testNamePostfix = "_" + implName;

        /*
         * Write the Test Functions to the Exports Object
         */
        exports.setUp = function (done) {
            var fixturesLoader = require('pow-mongodb-fixtures').connect('test');
            fixturesLoader.clearAndLoad(fixtures, function (err) {
                if (err) throw err;
                fixturesLoader.client.close();
                mongoose.connect('mongodb://localhost/test');
                done();
            });
        };

        exports.tearDown = function (done) {
            mongoose.disconnect();
            done();
        };

        exports['test_modelStatics' + testNamePostfix] = function (test) {
            MONGOOSE_MODEL_STATICS.forEach(function (funcName) {
                //console.log(funcName);
                test.equal(typeof UserModel[customMapper(funcName)], 'function');
            });
            test.done();
        };

        exports['test_modelMethods' + testNamePostfix] = function (test) {
            var model = new UserModel();
            MONGOOSE_MODEL_METHODS.forEach(function (funcName) {
                //console.log(funcName);
                test.equal(typeof model[customMapper(funcName)], 'function');
            });
            test.done();
        };

        exports['test_queryInstances' + testNamePostfix] = function (test) {
            var query = UserModel.find();
            MONGOOSE_QUERY_METHODS.forEach(function (funcName) {
                //console.log(funcName);
                test.equal(typeof query[customMapper(funcName)], 'function');
            });
            test.done();
        };

        exports['test_findById__and__populate' + testNamePostfix] = function (test) {
            PostSchema.__test = test;
            PostModel[customMapper('findById')](fixtures.posts.p1._id)
                .then(function (result) {
                    //console.log('Model.findById-->', result);
                    test.ok(result);
                    return result[customMapper('populate')]('author');
                })
                .then(function (result) {
                    //console.log('Model#populate-->', result);
                    test.ok(result);
                })
                [catchName](test.ifError)
                .done(test.done);
        };

        exports['test_findById__and__exec' + testNamePostfix] = function (test) {
            PostSchema.__test = test;
            PostModel.findById(fixtures.posts.p1._id)[customMapper('exec')]()
                .then(function (result) {
                    //console.log('Model.findById and Query#exec-->', result);
                    test.ok(result);
                })
                [catchName](test.ifError)
                .done(test.done);
        };

        exports['test_create' + testNamePostfix] = function (test) {
            UserModel[customMapper('create')]({name: 'hello'}, {name: 'world'})
                .then(function (createdUsers) {
                    //console.log('created users:', arguments);
                    test.equal(createdUsers.length, 2);
                    test.equal(createdUsers[0].name, 'hello');
                    test.equal(createdUsers[1].name, 'world');
                })
                [catchName](function (err) {
                    //console.log(err);
                    test.ifError(err);
                })
                .done(test.done);
        };

        exports['test_create_spread' + testNamePostfix] = function (test) {
            UserModel[customMapper('create')]({name: 'hello spread'}, {name: 'world spread'})
                .spread(function (createdUser1, createdUser2) {
                    //console.log('created users:', arguments);
                    test.equal(createdUser1.name, 'hello spread');
                    test.equal(createdUser2.name, 'world spread');
                })
                [catchName](function (err) {
                    //console.log(err);
                    test.ifError(err);
                })
                .done(test.done);
        };

        exports['test_update_spread' + testNamePostfix] = function (test) {
            PostSchema.__test = test;
            PostModel[customMapper('update')]({_id: fixtures.posts.p1._id}, { title: 'changed'})
                .spread(function (affectedRows, raw) {
                    console.log('Model.update-->', arguments);
                    test.equal(affectedRows, 1);
                    test.ok(raw);
                })
                [catchName](test.ifError)
                .done(test.done);
        };

        exports['test_save' + testNamePostfix] = function (test) {
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
            post[customMapper('save')]()
                .spread(function (result, affectedRows) {// with 'spread' options
                    //console.log('Model#save-->', arguments);
                    test.ok(result);
                    test.equal(affectedRows, 1);
                    test.ok(!result.isNew);
                    test.ok(result._id);
                    test.equal(result.title, 'new-title');
                    test.equal(result.author.toString(), fixtures.users.u1._id.toString());
                })
                [catchName](test.ifError)
                .done(test.done);
        };

        exports['test_issue2' + testNamePostfix] = function (test) {
            UserModel[customMapper('findById')](fixtures.users.u1._id)
                .then(function (user) {
                    return [ user, PostModel.find().populate('author')[customMapper('exec')]() ];
                })
                .spread(function (user, users) {
                    //console.log('user:', user);
                    //console.log('users:', users);
                    test.ok(user);
                    test.ok(users);
                })
                [catchName](function (err) {
                    //console.log(err);
                    test.ifError(err);
                })
                .done(test.done);
        };
    }
};