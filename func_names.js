module.exports = {
  MODEL_STATICS: [
    // mongoose.Model static
    'remove', 'ensureIndexes', 'find', 'findById', 'findOne', 'count', 'distinct',
    'findOneAndUpdate', 'findByIdAndUpdate', 'findOneAndRemove', 'findByIdAndRemove',
    'create', 'update', 'mapReduce', 'aggregate', 'populate',
    'geoNear', 'geoSearch',
    // mongoose.Document static
    'update'
  ],
  MODEL_METHODS: [
    // mongoose.Model instance
    'save', 'remove',
    // mongoose.Document instance
    'populate', 'update', 'validate'
  ],
  QUERY_METHODS: [
    // mongoose.Query instance
    'find', 'exec', 'findOne', 'count', 'distinct', 'update', 'remove',
    'findOneAndUpdate', 'findOneAndRemove', 'lean', 'limit', 'skip', 'sort'
  ],
  AGGREGATE_METHODS: [
    'exec'
  ]
};
