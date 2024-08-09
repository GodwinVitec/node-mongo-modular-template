const BaseTransformer = require('../BaseTransformer');

describe('BaseTransformer', () => {
  let baseTransformer;

  beforeAll(() => {
    baseTransformer = new BaseTransformer();
  });

  test('should contain the transform method', () => {
    expect(baseTransformer).toHaveProperty('transform');
    expect(baseTransformer.transform).toBeInstanceOf(Function);
  });

  test('should contain the transformCollection method', () => {
    expect(baseTransformer).toHaveProperty('transformCollection');
    expect(baseTransformer.transformCollection).toBeInstanceOf(Function);
  });

  describe('transform', () => {
    test('should be implemented by child classes and throw error otherwise', () => {
      class TransformerWithoutImplementedTransform extends BaseTransformer {
        constructor() {
          super();
        }
      }

      class TransformerWithTransform extends BaseTransformer {
        constructor() {
          super();
        }

        transform(item) {
          return {key: item.key}
        }
      }

      const transformer1 = new TransformerWithoutImplementedTransform();
      const transformer2 = new TransformerWithTransform();

      expect(() => transformer1.transform({key: 1}))
        .toThrow('You have to implement the method transform!');

      expect(() => transformer2.transform({key: 1}))
        .not.toThrow();
    });
  });

  describe('transformCollection', () => {
    test('should throw error if the collection passed is not iterable', () => {
      expect(() => baseTransformer.transformCollection({key: 'value'}))
        .toThrow(/iterable/);
    });

    test('should call the transform method to perform the transformation for each item in the collection', () => {
      const items = [
        {key: 1},
        {key: 2},
        {key: 3}
      ];

      const mockTransform = jest.fn();
      baseTransformer.transform = mockTransform;

      baseTransformer.transformCollection(items);

      expect(mockTransform).toHaveBeenCalledTimes(3);
      expect(mockTransform).toHaveBeenNthCalledWith(1, items[0]);
      expect(mockTransform).toHaveBeenNthCalledWith(2, items[1]);
      expect(mockTransform).toHaveBeenNthCalledWith(3, items[2]);
    });
  })
})