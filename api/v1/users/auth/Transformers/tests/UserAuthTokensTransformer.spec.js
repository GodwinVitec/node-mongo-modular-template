const UserAuthTokensTransformer = require('../UserAuthTokensTransformer');
const BaseTransformer = require('../../../../BaseTransformer');

describe('UserAuthTokensTransformer', () => {
  let userAuthtokensTransformer;

  beforeAll(() => {
    userAuthtokensTransformer = new UserAuthTokensTransformer();
  });

  it('should extend BaseTransformer', () => {
    expect(userAuthtokensTransformer).toBeInstanceOf(BaseTransformer);
  });

  it('should implement the transform method', () => {
    expect(userAuthtokensTransformer.transform).not
      .toThrow(/you have to implement/i);

    expect(() => userAuthtokensTransformer.transform({}))
      .toBeTruthy();
  });


  describe('transform', () => {
    it('should return an object with the expected keys', () => {
      const mockAuthTokens = {
        accessToken: '234565eqwf23wedq45t',
        refreshToken: '234565eqwf23wedq45t89345itrj',
      };

      const props = [
        'accessToken',
        'refreshToken'
      ];

      expect(Object.keys(
        userAuthtokensTransformer.transform({}))
      ).toEqual(expect.arrayContaining(props)); // unconditionally return the agreed object

      expect(Object.keys(
        userAuthtokensTransformer.transform(mockAuthTokens))
      ).toEqual(expect.arrayContaining(props)); // with the correct details as well.
    })
  })
})