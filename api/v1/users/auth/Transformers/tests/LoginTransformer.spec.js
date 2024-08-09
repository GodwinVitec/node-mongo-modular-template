const LoginTransformer = require('../LoginTransformer');
const BaseTransformer = require('../../../../BaseTransformer');

describe('LoginTransformer', () => {
  let loginTransformer;

  beforeAll(() => {
    loginTransformer = new LoginTransformer();
  });

  it('should extend BaseTransformer', () => {
    expect(loginTransformer).toBeInstanceOf(BaseTransformer);
  });

  it('should implement the transform method', () => {
    expect(loginTransformer.transform).not
      .toThrow(/you have to implement/i);

    expect(() => loginTransformer.transform({}))
      .toBeTruthy();
  });


  describe('transform', () => {
    it('should return an object with the expected keys', () => {
      const mockUser = {
        _id: 'Anything goes',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        initials: 'JD',
        username: 'johndoe',
        phoneNumber: '08012345678',
        profileImage: 'https://example.com/image.jpg',
        role: 'user',
        clearanceLevel: 1,
        status: 'active',
        isActive: true,
        lastLogin: new Date(),
      };

      const props = [
        'id',
        'firstName',
        'lastName',
        'fullName',
        'initials',
        'username',
        'phoneNumber',
        'profileImage',
        'role',
        'clearanceLevel',
        'status',
        'isActive',
        'lastLogin',
        'lastLoginExpressive'
      ];

      expect(Object.keys(
        loginTransformer.transform({}))
      ).toEqual(expect.arrayContaining(props)); // unconditionally return the agreed object

      expect(Object.keys(
        loginTransformer.transform(mockUser))
      ).toEqual(expect.arrayContaining(props)); // with the correct details as well.
    })
  })
})