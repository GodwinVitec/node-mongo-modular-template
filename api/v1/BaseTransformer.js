class BaseTransformer {
  transform(item) {
    throw new Error('You have to implement the method transform!');
  }

  transformCollection(collection) {
    if (!Array.isArray(collection)) {
      throw new Error('The collection must be an array or iterable.');
    }

    return collection.map(item => this.transform(item));
  }
}

module.exports = BaseTransformer;