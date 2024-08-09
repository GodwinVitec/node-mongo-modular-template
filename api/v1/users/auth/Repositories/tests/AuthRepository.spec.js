const mongoose = require('mongoose');
const AuthRepository = require('../AuthRepository');
const Commons = require("../../../../../../api/helpers/commons");
const UserAuthToken = require('../../Models/UserAuthToken');

const env = (new Commons()).env;

describe('AuthRepository', () => {
  let authRepository;

  const uri = 'mongodb://localhost:27017/test_shippa';

  beforeAll(async () => {
    await mongoose.connect(uri);

    authRepository = new AuthRepository();
  }, 10000);

  afterAll(async () => {
    await mongoose.connection.close();
  }, 10000);

  it('should have the createAuthToken method', () => {
    expect(authRepository).toHaveProperty('createAuthToken');
    expect(authRepository.createAuthToken).toBeInstanceOf(Function);
  });

  it('should have the updateAuthToken method', () => {
    expect(authRepository).toHaveProperty('updateAuthToken');
    expect(authRepository.updateAuthToken).toBeInstanceOf(Function);
  });

  it('should have the destroyAuthToken method', () => {
    expect(authRepository).toHaveProperty('destroyAuthToken');
    expect(authRepository.destroyAuthToken).toBeInstanceOf(Function);
  });

  it('should have the getUserAuthTokens method', () => {
    expect(authRepository).toHaveProperty('getUserAuthTokens');
    expect(authRepository.getUserAuthTokens).toBeInstanceOf(Function);
  });

  it('should have the getUserAuthToken method', () => {
    expect(authRepository).toHaveProperty('getUserAuthToken');
    expect(authRepository.getUserAuthToken).toBeInstanceOf(Function);
  });

  describe('createAuthToken', () => {
    it('should throw error if called without the prameter or with invalid object', async () => {
      await expect(authRepository.createAuthToken())
        .rejects.toThrow(/required/i);

      await expect(authRepository.createAuthToken({}))
        .rejects.toThrow(/required/i);

      await expect(authRepository.createAuthToken({accessToken:'anything'}))
        .rejects.toThrow();
    });

    it('should create the auth tokens for with the complete data.', async () => {
      const authTokenData = {
        user: new mongoose.Types.ObjectId(),
        accessToken: 'anything',
        refreshToken: 'something'
      };

      await expect(authRepository.createAuthToken(authTokenData))
        .resolves.toMatchObject(authTokenData);
    });
  });

  describe('getUserAuthToken', () => {
    it('should not throw error without the filter parameter', async () => {
      await expect(authRepository.getUserAuthToken())
        .resolves.not.toThrow();
    });

    it('should not return more than one document', async () => {
      await expect(authRepository.getUserAuthToken({accessToken: 'anything'}))
        .resolves.not.toBeInstanceOf(Array);
    });

    it('should return an instance of a document that contains the filter parameter', async () => {
      const authTokenData = {
        user: new mongoose.Types.ObjectId(),
        accessToken: 'anything',
        refreshToken: 'something'
      };

      await expect(authRepository.createAuthToken(authTokenData))
        .resolves.not.toThrow();

      const filter = {
        accessToken: 'anything'
      };

      const result = await authRepository.getUserAuthToken(filter);

      expect(result).toBeInstanceOf(mongoose.Document);
      expect(result).toMatchObject(filter)
    });

    it('should return \'null\' if the filter fails', async () => {
      const filter = {accessToken: 'anything'};

      await UserAuthToken.deleteMany(filter).exec(); // delete all matching tokens to be sure;

      await expect(authRepository.getUserAuthToken(filter))
        .resolves.toBeNull();
    });
  });

  describe('getUserAuthTokens', () => {
    it('should throw error for invalid user', async () => {
      await expect(authRepository.getUserAuthTokens({_id: 'anyany'}))
        .rejects.toThrow();
    });

    it('should return a list of documents for a valid user', async () => {
      await expect(authRepository.getUserAuthTokens({_id: new mongoose.Types.ObjectId()}))
        .resolves.toBeInstanceOf(Array);
    });

    it('should contain the expected object in the list of documents', async () => {
      const authTokenData = {
        user: new mongoose.Types.ObjectId(),
        accessToken: 'anything',
        refreshToken: 'something',
      };

      await expect(authRepository.createAuthToken(authTokenData))
        .resolves.not.toThrow();

      await expect(authRepository.getUserAuthTokens({accessToken: 'anything'}))
        .resolves.toMatchObject([authTokenData]);
    });
  });

  describe('deleteAuthToken', () => {
    it('should throw error for invalid filter', async () => {
      await expect(authRepository.destroyAuthToken())
        .rejects.toThrow(/required/i);
    });

    it('should delete the token for the filter', async () => {
      const filter = {accessToken: 'another thing'};
      await UserAuthToken.deleteMany(filter).exec(); // delete matching tokens first to be sure

      const authTokenData = {
        user: new mongoose.Types.ObjectId(),
        refreshToken: 'no other thing',
        ...filter
      };

      await expect(authRepository.createAuthToken(authTokenData))
        .resolves.not.toThrow();

      await expect(authRepository.destroyAuthToken(filter))
        .resolves.not.toThrow();

      await expect(authRepository.getUserAuthToken(filter)) // Try to get the token back.
        .resolves.toBeNull();
    });
  })
})