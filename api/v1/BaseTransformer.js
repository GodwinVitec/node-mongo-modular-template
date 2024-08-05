class BaseTransformer {
  transform(item) {
    throw new Error('You have to implement the method transform!');
  }

  transformCollection(collection) {
    return collection.map(item => this.transform(item));
  }
}

module.exports = BaseTransformer;