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
    author: users.u1._id
  },
  p2: {
    _id: id(),
    title: 'two',
    author: users.u2._id
  },
  p3: {
    _id: id(),
    title: 'three',
    author: users.u3._id
  },
  p4: {
    _id: id(),
    title: 'four',
    author: users.u4._id
  }
};

module.exports = {
  users: users,
  posts: posts
};
