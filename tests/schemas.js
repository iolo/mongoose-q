'use strict';

var
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    UserSchema = new Schema({
        name: String
    }),
    PostSchema = new Schema({
        title: String,
        author: {type: Schema.Types.ObjectId, ref: 'User'},
        comments: [{
            content: String,
            author: {type: Schema.Types.ObjectId, ref: 'User'}
        }]
    }),
    debug = require('debug')('test');

PostSchema.plugin(function (schema) {
    schema.pre('save', function (next) {
        debug('*** pre save', this);
        this.__pre_save_called = true;
        next();
    });
    schema.post('save', function (doc) {
        debug('*** post save', doc);
        this.__post_save_called = true;
    });
}, {});

module.exports = {
    UserSchema: UserSchema,
    PostSchema: PostSchema
};
