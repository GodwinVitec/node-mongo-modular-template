const mongoose = require('mongoose');
const AuthService = require('../AuthService');
const User = require('../../../self/Models/User');
const OTP = require('../../Models/OTP');
const SignInAttempt = require('../../Models/SignInAttempt');
const UserAuthToken = require('../../Models/UserAuthToken');
const Commons = require('../../../../../helpers/commons');
const moment = require("moment/moment");


const commons = new Commons();
const env = commons.env;
const config = commons.config;
const trans = commons.trans;

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

  const user3 = {
    "_id": new mongoose.Types.ObjectId("66ab6eab8ce618569b299e90"),
    "firstName": "Graham",
    "lastName": "Potter",
    "username": "graham-potter",
    "password": "$2a$10$viqYYteq",
    "email": "graham-potter@preston.org",
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

  const user1SignInCreds = {
    username: user1.username,
    password: user1.password
  };

  const user2SignInCreds = {
    username: user2.username,
    password: user2.password
  };

  const user3SignInCreds = {
    username: user3.username,
    password: user3.password
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

  const user3SignUpData = {
    firstName: user3.firstName,
    lastName: user3.lastName,
    email: user3.email,
    password: user3.password,
    username: user3.username
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
      await User.deleteMany({}).exec();
      await SignInAttempt.deleteMany({}).exec();
      await OTP.deleteMany({}).exec();
    }, 100000);

    it('should be a method', () => {
      expect(authService.attempt).toBeDefined();
      expect(authService.attempt).toBeInstanceOf(Function);
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

    it('should return a error response if the suspension time unit is provided and invalid', async () => {
      let response = await authService.attempt(
        user1SignInCreds,
        req,
        'invalidTimeUnit'
      );
      expect(response.errors[0])
        .toMatch(/invalid suspension time unit/i);

      response = await authService.attempt(
        user1SignInCreds,
        req,
        19900
      );

      expect(response.errors[0])
        .toMatch(/invalid suspension time unit/i);

      response = await authService.attempt(
        user1SignInCreds,
        req,
        {}
      );

      expect(response.errors[0])
        .toMatch(/invalid suspension time unit/i);
    });

    it('should return an error response if the user does not exist', async() => {
      const response = await authService.attempt(user1SignInCreds, req);
      expect(response.status).toBe(false);

      expect(response.errors[0])
        .toMatch(/credentials do not match our records/i);
    });

    it('should prevent the user from signing in if the user account has status of isActive=false', async () => {
      const matchData = {...user1SignUpData};
      delete matchData.password;

      const signupResponse = await authService.signup(user1SignUpData);
      const userData = signupResponse.data.toJSON();

      expect(userData)
        .toMatchObject(matchData);

      expect(userData.isActive)
        .toBe(false);

      const response = await authService.attempt(
        user1SignInCreds,
        req
      );

      expect(response).toHaveProperty(
        'status',
        false
      );

      expect(response.errors[0])
        .toMatch(
          /account has been blocked. Please contact the admin/i
        );

      await expect(SignInAttempt.find(user1SignInCreds))
        .resolves.toHaveLength(0);
    });

    it('should suspend the user account for matching suspension time unit', async () => {
      const matchData = {...user1SignUpData};
      delete matchData.password;

      const signupResponse = await authService.signup(user1SignUpData);
      expect(signupResponse.data.toJSON())
        .toMatchObject(matchData);

      const thresholdCount = config(
        "auth.account.suspension.thresholdCounts.ALERT"
      );

      const falseData = {
        username: user1SignInCreds.username,
        password: user1SignInCreds.password + 'w124'
      };

      const suspensionTimeUnit = config(
        "auth.account.suspension.timeUnits.YEARS"
      );

      for(let i = 0; i < thresholdCount; i++) {
        const response = await authService.attempt(
          falseData,
          req,
          suspensionTimeUnit
        );

        expect(response).toHaveProperty(
          'status',
          false
        );
      }

      await expect(SignInAttempt.find(falseData))
        .resolves.toHaveLength(thresholdCount);

      const updatedUser = (await User.findOne(matchData)).toJSON();

      await expect(updatedUser)
        .toHaveProperty(
          'suspensionTimeUnit',
          suspensionTimeUnit
        );
    });

    it('should return an error response of invalid credentials and create sign-in-attempt records only if sign-in-attempts are below the ALERT threshold', async () => {
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

    it('should suspend the account and create sign-in-attempt records if sign-in-attempts are greater than or equal to the ALERT threshold', async () => {
      const matchData = {...user1SignUpData};
      delete matchData.password;

      const signupResponse = await authService.signup(user1SignUpData);
      expect(signupResponse.data.toJSON())
        .toMatchObject(matchData);

      const alertSignInAttemptsThreshold = config(
        "auth.account.suspension.thresholdCounts.ALERT"
      );

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

        if(i < alertSignInAttemptsThreshold - 1) {
          expect(response.errors[0])
            .toMatch(/invalid sign in credentials/i);
        } else {
          expect(response.errors[0])
            .toMatch(/account has been blocked until/i);
        }
      }

      await expect(SignInAttempt.find(falseData))
        .resolves.toHaveLength(alertSignInAttemptsThreshold);
    });

    it('should suspend the account for matching duration for the corresponding threshold', async () => {
      const matchData = {...user1SignUpData};
      delete matchData.password;

      const signupResponse = await authService.signup(user1SignUpData);
      expect(signupResponse.data.toJSON())
        .toMatchObject(matchData);

      const falseData = {
        username: user1SignInCreds.username,
        password: user1SignInCreds.password + 'w124'
      };

      const thresholds = config(
        "auth.account.suspension.thresholdCounts"
      );
      const thresholdKeys = Object.keys(thresholds);

      const suspensionDurations = config(
        "auth.account.suspension.duration"
      );

      // Simulate incremental failed sign-in attempts with increasing thresholds
      for (let j = 0; j < thresholdKeys.length; j++) {
        const thresholdKey = thresholdKeys[j];
        const initialThreshold = thresholds[thresholdKey];
        let thresholdCount = initialThreshold;

        if(
          j > 0 &&
          thresholds[thresholdKeys[j - 1]] < thresholdCount
        ) {
          thresholdCount = thresholdCount - thresholds[thresholdKeys[j - 1]];
        }

        for(let i = 0; i < thresholdCount; i++) {
          const response = await authService.attempt(
            falseData,
            req
          );

          expect(response).toHaveProperty(
            'status',
            false
          );

          if(
            j < 1 &&
            i < thresholdCount - 1
          ) {
            expect(response.errors[0])
              .toMatch(/invalid sign in credentials/i);
          } else {
            expect(response.errors[0])
              .toMatch(/account has been blocked until/i);
          }
        }
        await expect(SignInAttempt.find(falseData))
          .resolves.toHaveLength(initialThreshold);

        const updatedUser = await User.findOne(matchData);

        expect(updatedUser.toJSON())
          .toHaveProperty('failedSignIns', initialThreshold);

        expect(updatedUser.toJSON())
          .toHaveProperty(
            'suspensionDuration',
            suspensionDurations[thresholdKey]
          );
      }
    });

    it('should prevent the user from signing-in with the right credentials after the failed attempts reaches the ALERT threshold and the suspension duration has not elapsed', async () => {
      const matchData = {...user1SignUpData};
      delete matchData.password;

      const signupResponse = await authService.signup(user1SignUpData);
      expect(signupResponse.data.toJSON())
        .toMatchObject(matchData);

      const thresholdCount = config(
        "auth.account.suspension.thresholdCounts.ALERT"
      );

      const falseData = {
        username: user1SignInCreds.username,
        password: user1SignInCreds.password + 'w124'
      };

      const suspensionTimeUnit = config(
        "auth.account.suspension.timeUnits.YEARS"
      );

      for(let i = 0; i < thresholdCount; i++) {
        const response = await authService.attempt(
          falseData,
          req,
          suspensionTimeUnit
        );

        expect(response).toHaveProperty(
          'status',
          false
        );
      }

      await expect(SignInAttempt.find(falseData))
        .resolves.toHaveLength(thresholdCount);

      const updatedUser = (await User.findOne(matchData)).toJSON();

      await expect(updatedUser)
        .toHaveProperty(
          'suspensionTimeUnit',
          suspensionTimeUnit
        );

      await expect(updatedUser)
        .toHaveProperty(
          'status',
          config("auth.account.statuses.SUSPENDED")
        );

      // Now try to sign in with the right credentials before the
      // suspension duration has elapsed
      const response = await authService.attempt(
        user1SignInCreds,
        req,
        suspensionTimeUnit
      );

      expect(response.errors[0])
        .toMatch(/account has been blocked until/i);
    });

    it('should prevent the user from signing-in with the right credentials after the failed attempts exceeds the ALERT threshold regardless of whether the suspension duration has elapsed', async () => {
      const matchData = {...user1SignUpData};
      delete matchData.password;

      const signupResponse = await authService.signup(user1SignUpData);
      expect(signupResponse.data.toJSON())
        .toMatchObject(matchData);

      const thresholdCount = config(
        "auth.account.suspension.thresholdCounts.WARN"
      );

      const falseData = {
        username: user1SignInCreds.username,
        password: user1SignInCreds.password + 'w126'
      };

      const suspensionTimeUnit = config(
        "auth.account.suspension.timeUnits.MILLISECONDS"
      );

      for(let i = 0; i < thresholdCount; i++) {
        const response = await authService.attempt(
          falseData,
          req,
          suspensionTimeUnit
        );

        expect(response).toHaveProperty(
          'status',
          false
        );
      }

      await expect(SignInAttempt.find(falseData))
        .resolves.toHaveLength(thresholdCount);

      const updatedUser = (await User.findOne(matchData)).toJSON();

      await expect(updatedUser)
        .toHaveProperty(
          'suspensionTimeUnit',
          suspensionTimeUnit
        );

      await expect(updatedUser)
        .toHaveProperty(
          'status',
          config("auth.account.statuses.SUSPENDED")
        );

      // Now try to sign in with the right credentials before the
      // suspension duration has elapsed
      const response = await authService.attempt(
        user1SignInCreds,
        req,
        suspensionTimeUnit
      );

      expect(response.errors[0])
        .toMatch(
          /Your account has been blocked. Please use the forgot password option/i
        );
    });

    it('should remove the failed sign-in-attempts if the user signs-in with the right credentials and the failed attempts are less than the ALERT threshold and return a success response', async () => {
      const matchData = {...user1SignUpData};
      delete matchData.password;

      const signupResponse = await authService.signup(user1SignUpData);
      expect(signupResponse.data.toJSON())
        .toMatchObject(matchData);

      // Activate the user account at database level
      await User.updateOne(
        {username: user1SignUpData.username},
        {
          status: config("auth.account.statuses.ACTIVE"),
          isActive: true
        }
      );

      const thresholdCount = config(
        "auth.account.suspension.thresholdCounts.ALERT"
      ) - 1;

      const falseData = {
        username: user1SignInCreds.username,
        password: user1SignInCreds.password + 'w124'
      };

      const suspensionTimeUnit = config(
        "auth.account.suspension.timeUnits.MINUTES"
      );

      for(let i = 0; i < thresholdCount; i++) {
        const response = await authService.attempt(
          falseData,
          req,
          suspensionTimeUnit
        );

        expect(response).toHaveProperty(
          'status',
          false
        );
      }

      // Confirm that the failed attempts have been recorded
      await expect(SignInAttempt.find(falseData))
        .resolves.toHaveLength(thresholdCount);

      // Confirm that the user account has not been suspended
      let updatedUser = (await User.findOne(matchData)).toJSON();

      expect(updatedUser.suspensionTimeUnit)
        .not.toStrictEqual(
          suspensionTimeUnit
        );

      expect(updatedUser.status)
        .not.toStrictEqual(
          config("auth.account.statuses.SUSPENDED")
        );

      // Failed sign-ins below ALERT level are not recorded
      expect(updatedUser.failedSignIns)
        .toBeNull();

      // Now try to sign in with the right credentials
      const response = await authService.attempt(
        user1SignInCreds,
        req,
        suspensionTimeUnit
      );

      expect(response.status)
        .toBe(true);

      expect(response.errors)
        .toBeUndefined();

      expect(response.data)
        .toMatchObject(matchData);

      expect(response.message)
        .toMatch(/attempt passed/i);

      // Check the updated user object again
      updatedUser = (await User.findOne(matchData)).toJSON();

      expect(updatedUser.failedSignIns)
        .toBeNull();

      // Confirm that no failed sign-ins are kept
      await expect(SignInAttempt.find(falseData))
        .resolves.toHaveLength(0);
    });

    it('should remove the failed sign-in-attempts if the failed attempts match the ALERT threshold and the user signs in with the right credentials after the time has elapsed and return a success response', async () => {
      const matchData = {...user2SignUpData};
      delete matchData.password;

      const signupResponse = await authService.signup(user2SignUpData);
      expect(signupResponse.data.toJSON())
        .toMatchObject(matchData);

      // Activate the user account at database level
      await User.updateOne(
        {username: user2SignUpData.username},
        {
          status: config("auth.account.statuses.ACTIVE"),
          isActive: true
        }
      );

      const thresholdCount = config(
        "auth.account.suspension.thresholdCounts.ALERT"
      );

      const falseData = {
        username: user2SignInCreds.username,
        password: user2SignInCreds.password + 'w128'
      };

      const suspensionTimeUnit = config(
        "auth.account.suspension.timeUnits.MILLISECONDS"
      );

      for(let i = 0; i < thresholdCount; i++) {
        const response = await authService.attempt(
          falseData,
          req,
          suspensionTimeUnit
        );

        expect(response).toHaveProperty(
          'status',
          false
        );
      }

      // Confirm that the failed attempts have been recorded
      await expect(SignInAttempt.find(falseData))
        .resolves.toHaveLength(thresholdCount);

      // Confirm that the user account has not been suspended
      let updatedUser = (await User.findOne(matchData)).toJSON();

      expect(updatedUser.suspensionTimeUnit)
        .toStrictEqual(
          suspensionTimeUnit
        );

      expect(updatedUser.status)
        .toStrictEqual(
          config("auth.account.statuses.SUSPENDED")
        );

      expect(updatedUser.suspendedAt)
        .not.toBeNull();

      // Failed sign-ins matching ALERT level and above are recorded
      expect(updatedUser.failedSignIns)
        .toStrictEqual(thresholdCount);

      // Expect the suspension duration to have elapsed
      expect(moment().isAfter(
        moment(updatedUser.suspendedAt)
          .add(
            updatedUser.suspensionDuration,
            updatedUser.suspensionTimeUnit ?? suspensionTimeUnit
          )
      )).toBe(true);

      // Now try to sign in with the right credentials
      const response = await authService.attempt(
        user2SignInCreds,
        req,
        suspensionTimeUnit
      );

      expect(response.status)
        .toBe(true);

      expect(response.errors)
        .toBeUndefined();

      expect(response.data)
        .toMatchObject(matchData);

      expect(response.message)
        .toMatch(/attempt passed/i);

      // Check the updated user object again
      updatedUser = (await User.findOne(matchData)).toJSON();

      expect(updatedUser.failedSignIns)
        .toBeNull();

      // Confirm that no failed sign-ins are kept
      await expect(SignInAttempt.find(falseData))
        .resolves.toHaveLength(0);
    });

    it('should always sign the user in with the right credentials on first trial without any complications', async () => {
      const matchData = {...user3SignUpData};
      delete matchData.password;

      const signupResponse = await authService.signup(user3SignUpData);
      expect(signupResponse.data.toJSON())
        .toMatchObject(matchData);

      // Activate the user account at database level
      await User.updateOne(
        {username: user3SignUpData.username},
        {
          status: config("auth.account.statuses.ACTIVE"),
          isActive: true
        }
      );

      // Now try to sign in with the right credentials
      const response = await authService.attempt(
        user3SignInCreds,
        req
      );

      expect(response.status)
        .toBe(true);

      expect(response.errors)
        .toBeUndefined();

      expect(response.data)
        .toMatchObject(matchData);

      expect(response.message)
        .toMatch(/attempt passed/i);

      // Check the updated user object again
      const updatedUser = (await User.findOne(matchData)).toJSON();

      expect(updatedUser.failedSignIns)
        .toBeNull();

      // Confirm that no failed sign-ins are kept
      await expect(SignInAttempt.find(user3SignInCreds))
        .resolves.toHaveLength(0);
    });
  });

  describe('getAuthTokens', () => {
    beforeEach(async() => {
      await User.deleteMany({}).exec();
      await UserAuthToken.deleteMany({}).exec();
    });

    it('should be a publicly available method', () => {
      expect(authService.getAuthTokens).toBeDefined();
      expect(authService.getAuthTokens)
        .toBeInstanceOf(Function);
    });

    it('should throw an error if the user is not a valid object', async () => {
      await expect(authService.getAuthTokens())
        .rejects.toThrow();

      await expect(authService.getAuthTokens({}))
        .rejects.toThrow();

      await expect(authService.getAuthTokens('string'))
        .rejects.toThrow();

      await expect(authService.getAuthTokens(123))
        .rejects.toThrow();

      await expect(authService.getAuthTokens(['string']))
        .rejects.toThrow();
    });

    it('should throw an error if the user does not exist', async () => {
      await expect(authService.getAuthTokens(user1))
        .rejects.toThrow(/credentials do not match our records/i);
    });

    it('should return a success response for an active user', async () => {
      const signUpResponse = await authService.signup(user1SignUpData);

      expect(signUpResponse.status).toBe(true);
      const user = signUpResponse.data.toJSON();

      // Activate the user account at database level
      await User.updateOne(
        {username: user.username},
        {
          status: config("auth.account.statuses.ACTIVE"),
          isActive: true
        }
      );

      const authTokensResponse = await authService.getAuthTokens(user);

      expect(authTokensResponse.status).toBe(true);

      expect(authTokensResponse.data)
        .toHaveProperty('accessToken');

      expect(authTokensResponse.data)
        .toHaveProperty('refreshToken');
    });
  });

  describe('refreshToken', () => {
    beforeEach(async () => {
      await User.deleteMany({}).exec();
      await UserAuthToken.deleteMany({}).exec();
    });

    it('should be a method', () => {
      expect(authService.refreshToken).toBeDefined();
      expect(authService.refreshToken)
        .toBeInstanceOf(Function);
    });

    it('should throw an error if the refreshToken parameter is not a string', async () => {
      await expect(authService.refreshToken())
        .rejects.toThrow(/refresh token provided is invalid/i);

      await expect(authService.refreshToken({}))
        .rejects.toThrow(/refresh token provided is invalid/i);

      await expect(authService.refreshToken(123))
        .rejects.toThrow(/refresh token provided is invalid/i);

      await expect(authService.refreshToken([]))
        .rejects.toThrow(/refresh token provided is invalid/i);
    });

    it('should return an error response if the refreshToken is invalid', async () => {
      await expect(authService.refreshToken('invalidToken'))
        .resolves.toHaveProperty('errors[0]', trans(
          "auth.errors.authTokens.notFound"
        ));
    });

    it('should return an error response if the refreshToken record was destroyed before the token could be refreshed', async () => {
      const createUserResponse = await authService.signup(user2SignUpData);

      expect(createUserResponse.status).toBe(true);
      const user = createUserResponse.data.toJSON();

      // Activate the user account at database level
      await User.updateOne(
        {username: user.username},
        {
          status: config("auth.account.statuses.ACTIVE"),
          isActive: true
        }
      );

      const authTokensResponse = await authService.getAuthTokens(user);

      expect(authTokensResponse.status).toBe(true);

      expect(authTokensResponse.data)
        .toHaveProperty('accessToken');

      expect(authTokensResponse.data)
        .toHaveProperty('refreshToken');

      const refreshToken = authTokensResponse.data.refreshToken;

      await UserAuthToken.deleteMany({refreshToken}).exec();

      await expect(authService.refreshToken(refreshToken))
        .resolves.toHaveProperty(
          'errors[0]',
          trans(
            "auth.errors.authTokens.notFound"
          )
        );
    });

    it('should return an error response if the user record was destroyed before the token could be refreshed', async () => {
      const addUserResponse = await authService.signup(user2SignUpData);

      expect(addUserResponse.status).toBe(true);
      const user = addUserResponse.data.toJSON();

      // Activate the user account at database level
      await User.updateOne(
        {username: user.username},
        {
          status: config("auth.account.statuses.ACTIVE"),
          isActive: true
        }
      );

      const authTokensResponse = await authService.getAuthTokens(user);

      expect(authTokensResponse.status).toBe(true);

      expect(authTokensResponse.data)
        .toHaveProperty('accessToken');

      expect(authTokensResponse.data)
        .toHaveProperty('refreshToken');

      const refreshToken = authTokensResponse.data.refreshToken;

      await User.deleteMany({username: user.username}).exec();

      await expect(authService.refreshToken(refreshToken))
        .resolves.toHaveProperty(
          'errors[0]',
          trans(
            "user.errors.account.notFound"
          )
        );
    });

    it('should return a success response if the refresh token is valid, still exists and the user account still exists', async () => {
      const addUserResponse = await authService.signup(user3SignUpData);

      expect(addUserResponse.status).toBe(true);
      const user = addUserResponse.data.toJSON();

      // Activate the user account at database level
      await User.updateOne(
        {username: user.username},
        {
          status: config("auth.account.statuses.ACTIVE"),
          isActive: true
        }
      );

      const authTokensResponse = await authService.getAuthTokens(user);

      expect(authTokensResponse.status).toBe(true);

      expect(authTokensResponse.data)
        .toHaveProperty('accessToken');

      expect(authTokensResponse.data)
        .toHaveProperty('refreshToken');

      const refreshToken = authTokensResponse.data.refreshToken;

      const response = await authService.refreshToken(refreshToken);

      expect(response).toHaveProperty(
          'status',
        true
      );

      expect(response.data).toHaveProperty(
        'accessToken',
      );

      expect(response.data).toHaveProperty(
        'refreshToken',
      );
    });
  });
});