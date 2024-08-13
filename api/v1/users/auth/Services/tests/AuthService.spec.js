const mongoose = require('mongoose');
const AuthService = require('../AuthService');
const User = require('../../../self/Models/User');
const OTP = require('../../Models/OTP');
const SignInAttempt = require('../../Models/SignInAttempt');
const Commons = require('../../../../../helpers/commons');


const commons = new Commons();
const env = commons.env;
const config = commons.config;

describe('AuthService', () => {
  // Mock Data
  const user1 = {
    "_id": new mongoose.Types.ObjectId("66ab6eab8ce618569b25a238"),
    "firstName": "John",
    "lastName": "Johnson",
    "username": "john-johnson",
    "password": "$2a$10$viqYYteq",
    "email": "john-johnson@preston.org",
    "countryPhoneCode": null,
    "phone": null,
    "profileImage": null,
    "role": "USER",
    "clearanceLevel": 0,
    "identificationType": null,
    "identificationNumber": null,
    "status": "INACTIVE",
    "lastLogin": "2024-08-01T11:17:27.000Z",
    "isActive": true
  };
  const user2 = {
    "_id": new mongoose.Types.ObjectId("66ab6eab8ce618569b299d34"),
    "firstName": "Kim",
    "lastName": "Hanson",
    "username": "kim-hanson",
    "password": "$2a$10$viqYYteq",
    "email": "kim-hanson@preston.org",
    "countryPhoneCode": null,
    "phone": null,
    "profileImage": null,
    "role": "USER",
    "clearanceLevel": 0,
    "identificationType": null,
    "identificationNumber": null,
    "status": "INACTIVE",
    "lastLogin": "2024-08-01T11:17:27.000Z",
    "isActive": true
  };

  const otpData = {
    purpose: config("auth.otp.types.LOGIN.title"),
    duration: 10,
    otp: '098720'
  };

  const user1SignInCreds = {
    username: user1.username,
    password: user1.password
  };

  const user2SignInCreds = {
    username: user2.username,
    password: user2.password
  };

  const user1SignUpData = {
    firstName: user1.firstName,
    lastName: user1.lastName,
    email: user1.email,
    password: user1.password,
    username: user1.username
  };

  const user2SignUpData = {
    firstName: user2.firstName,
    lastName: user2.lastName,
    email: user2.email,
    password: user2.password,
    username: user2.username
  };

  const req = {
    validated: {},
    ip: '123:89:84:9:23',
    headers: {},
    connection: {}
  };

  let authService;

  beforeAll(async () => {
    const uri = `mongodb://${env('TEST_DB_HOST')}:${env('TEST_DB_PORT')}/${env('TEST_DB_NAME')}`;

    await mongoose.connect(uri);

    authService = new AuthService();
  }, 100000);

  afterAll(async () => {
    await mongoose.connection.close();
  }, 100000);

  describe('authRepository', () => {
    it('should be a private property', () => {
      expect(authService.authRepository).toBeUndefined();
    });
  });

  describe('signInAttemptRepository', () => {
    it('should be a private property', () => {
      expect(authService.signInAttemptRepository).toBeUndefined();
    });
  });

  describe('userService', () => {
    it('should be a private property', () => {
      expect(authService.userService).toBeUndefined();
    });
  });

  describe('commonHelper', () => {
    it('should be a private property', () => {
      expect(authService.commonHelper).toBeUndefined();
    });
  });

  describe('dateHelper', () => {
    it('should be a private property', () => {
      expect(authService.dateHelper).toBeUndefined();
    });
  });

  describe('onFailedSignInAttempt', () => {
    it('should be a private property', () => {
      expect(authService.onFailedSignInAttempt).toBeUndefined();
    });
  });

  describe('validateSuspensionConfig', () => {
    it('should be a private property', () => {
      expect(authService.validateSuspensionConfig).toBeUndefined();
    });
  });

  describe('signup', () => {
    beforeEach(async() => {
      await User.deleteMany({email: user1.email}).exec();
      await User.deleteMany({email: user2.email}).exec();
    }, 100000);

    it('should be a method', () => {
      expect(authService.signup).toBeDefined();
      expect(authService.signup)
        .toBeInstanceOf(Function);
    });

    it('should always return an object with a status property', async () => {
      await expect(authService.signup())
        .resolves.toHaveProperty('status');

      await expect(authService.signup(user1))
        .resolves.toHaveProperty('status');
    });

    it('should return an object with a status property of false if the user object is not provided', async () => {
      const response = await authService.signup();

      expect(response.status).toBe(false);
    });

    it('should return an object with a status property of false if the user object is not an object', async () => {
      const response = await authService.signup('user');

      expect(response.status).toBe(false);
    });

    it('should return a success response if the user data is valid', async () => {
      const response = await authService.signup(user1SignUpData);
      const matchData = {...user1SignUpData};

      delete matchData.password;

      expect(response.status).toBe(true);
      expect(response.data.toJSON()).toMatchObject(matchData);
    });
  });

  describe('attempt', () => {
    beforeEach(async() => {
      await User.deleteMany({email: user1.email}).exec();
      await User.deleteMany({email: user2.email}).exec();
      await SignInAttempt.deleteMany({}).exec();
    }, 100000);

    it('should be a method', () => {
      expect(authService.attempt).toBeDefined();
      expect(authService.attempt)
        .toBeInstanceOf(Function);
    });

    it('should always return an object with a status property', async () => {
      await expect(authService.attempt())
        .resolves.toHaveProperty('status');

      await expect(authService.attempt(user1.email))
        .resolves.toHaveProperty('status');
    });

    it('should return an object with status false if the user data is invalid', async () => {
      let userData = {};

      await expect(authService.attempt(userData))
        .resolves.toHaveProperty('status', false);

      userData = {username: 123};

      await expect(authService.attempt(userData))
        .resolves.toHaveProperty('status', false);
    });

    it('should return a false response if the request object is not provided or invalid', async () => {
      const response = await authService.attempt(user2SignInCreds);
      expect(response.errors)
        .toBeDefined();

      expect(response.errors[0])
        .toMatch(/request object/i);
    });

    it('should return an error response if the user does not exist', async() => {
      const response = await authService.attempt(user1SignInCreds, req);
      expect(response.status).toBe(false);

      expect(response.errors[0])
        .toMatch(/credentials do not match our records/i);
    });

    it.only('should return an error response of invalid credentials and create sign-in-attempt records only if sign-in-attempts are below the ALERT threshold', async () => {
      const matchData = {...user1SignUpData};
      delete matchData.password;

      const signupResponse = await authService.signup(user1SignUpData);
      expect(signupResponse.data.toJSON())
        .toMatchObject(matchData);

      const alertSignInAttemptsThreshold = config(
        "auth.account.suspension.thresholdCounts.ALERT"
      ) - 1;

      const falseData = {
        username: user1SignInCreds.username,
        password: user1SignInCreds.password + 'w124'
      };

      for(let i = 0; i < alertSignInAttemptsThreshold; i++) {
        const response = await authService.attempt(
          falseData,
          req
        );

        expect(response).toHaveProperty(
          'status',
          false
        );

        expect(response.errors[0])
          .toMatch(/Invalid sign in credentials/i);
      }

      await expect(SignInAttempt.find(falseData))
        .resolves.toHaveLength(alertSignInAttemptsThreshold);
    });
  });
});