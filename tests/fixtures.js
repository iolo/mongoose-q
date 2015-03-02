'use strict';

var id = require('pow-mongodb-fixtures').createObjectId;

var users = {
  u1: {
    _id: id(),
    name: 'foo'
  },
  u2: {
    _id: id(),
    name: 'bar'
  },
  u3: {
    _id: id(),
    name: 'baz'
  },
  u4: {
    _id: id(),
    name: 'qux'
  }
};

var posts = {
  p1: {
    _id: id(),
    title: 'one',
    author: users.u1._id,
    comments: [
        { content:'first comment for one', author:users.u1._id },
        { content:'second comment for one', author:users.u2._id },
        { content:'second comment for one', author:users.u3._id }
    ]
  },
  p2: {
    _id: id(),
    title: 'two',
    author: users.u2._id,
    comments: [
        { content:'first comment for two', author:users.u2._id },
        { content:'second comment for two', author:users.u3._id },
        { content:'second comment for two', autho:users.u4._id }
    ]
  },
  p3: {
    _id: id(),
    title: 'three',
    author: users.u3._id,
    comments: [
        { content:'first comment for three', author:users.u3._id },
        { content:'second comment for three', author:users.u4._id },
        { content:'second comment for three', author:users.u1._id }
    ]
  },
  p4: {
    _id: id(),
    title: 'four',
    author: users.u4._id,
    comments: [
        { content:'first comment for four', author:users.u4._id },
        { content:'second comment for four', author:users.u1._id },
        { content:'second comment for four', author:users.u2._id }
    ]
  }
};

module.exports = {
  users: users,
  posts: posts
};
