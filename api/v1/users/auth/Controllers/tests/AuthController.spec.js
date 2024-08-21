const request = require('supertest');
const app = require('../../../../../../app');
const mongoose = require("mongoose");
const AuthController = require('../AuthController');
const Commons = require("../../../../../helpers/commons");
const User = require('../../../self/Models/User');
const OTP = require('../../Models/OTP');
const SignInAttempt = require('../../Models/SignInAttempt');


const commons = new Commons();
const env = commons.env;
const config = commons.config;
const trans = commons.trans;

describe('AuthController', () => {
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
    passwordConfirmation: user1.password,
    username: user1.username
  };

  const user2SignUpData = {
    firstName: user2.firstName,
    lastName: user2.lastName,
    email: user2.email,
    password: user2.password,
    passwordConfirmation: user2.password,
    username: user2.username
  };

  const user3SignUpData = {
    firstName: user3.firstName,
    lastName: user3.lastName,
    email: user3.email,
    password: user3.password,
    passwordConfirmation: user3.password,
    username: user3.username
  };

  const weakPasswordData = {
    ...user3SignUpData,
    password: 'weak',
    passwordConfirmation: 'weak'
  };

  let authController = new AuthController();

  beforeAll(async () => {
    const uri = `mongodb://${env('TEST_DB_HOST')}:${env('TEST_DB_PORT')}/${env('TEST_DB_NAME')}`;

    await mongoose.connect(uri);
  }, 100000);

  afterAll(async () => {
    await mongoose.connection.close();
  }, 100000);

  describe('authService', () => {
    it('should be a private property', () => {
      expect(authController.authService)
        .toBeUndefined();
    });
  });

  describe('userService', () => {
    it('should be a private property', () => {
      expect(authController.userService)
        .toBeUndefined();
    });
  });

  describe('otpService', () => {
    it('should be a private property', () => {
      expect(authController.otpService)
        .toBeUndefined();
    });
  });

  describe('loginTransformer', () => {
    it('should be a private property', () => {
      expect(authController.loginTransformer)
        .toBeUndefined();
    });
  });

  describe('userAuthTokenTransformer', () => {
    it('should be a private property', () => {
      expect(authController.userAuthTokenTransformer)
        .toBeUndefined();
    });
  });

  describe('userTransformer', () => {
    it('should be a private property', () => {
      expect(authController.userTransformer)
        .toBeUndefined();
    });
  });

  describe('commonHelper', () => {
    it('should be a private property', () => {
      expect(authController.commonHelper)
        .toBeUndefined();
    });
  });

  describe('signup', () => {
    beforeEach(async () => {
      await User.deleteMany({}).exec();
    });

    it('should return a bad response if the password is weak', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send(weakPasswordData)
        .expect('Content-Type', /json/)
        .expect(422);

      const responseData = response.body;

      expect(responseData.status)
        .toBe(false);

      expect(responseData.error)
        .toBeDefined();

      expect(responseData.error)
        .toBeInstanceOf(Object);

      expect(responseData.error)
        .toHaveProperty('password');

      expect(responseData.error.password)
        .toBeInstanceOf(Array);

      expect(responseData.error.password)
        .toContain('password must be at least 8 characters long, must contain at least one uppercase letter, one lowercase letter, one number and one special character');
    });

    it('should return a bad response if the password does not match the password confirmation', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          ...user1SignUpData,
          passwordConfirmation: user1SignUpData.passwordConfirmation + 'blah'
        })
        .expect('Content-Type', /json/)
        .expect(400);

      const responseData = response.body;

      expect(responseData.status)
        .toBe(false);

      expect(responseData.error)
        .toBeDefined();

      expect(responseData.error)
        .toBeInstanceOf(Array);

      expect(responseData.error[0])
        .toMatch(
          /The password confirmation must match the password./i
        );
    });

    it('should return a bad response if the email has been taken', async () => {
      await request(app)
        .post('/api/v1/auth/signup')
        .send(user1SignUpData)
        .expect('Content-Type', /json/)
        .expect(201);

      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send(user1SignUpData)
        .expect('Content-Type', /json/)
        .expect(400);

      const responseData = response.body;

      expect(responseData.status)
        .toBe(false);

      expect(responseData.error)
        .toBeDefined();

      expect(responseData.error)
        .toBeInstanceOf(Array);

      expect(responseData.error[0])
        .toMatch(/This email has already been registered. Please sign in./i);
    });

    it('should return a bad response if the username has been taken', async () => {
      await request(app)
        .post('/api/v1/auth/signup')
        .send(user1SignUpData)
        .expect('Content-Type', /json/)
        .expect(201);

      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          ...user2SignUpData,
          username: user1SignUpData.username
        })
        .expect('Content-Type', /json/)
        .expect(400);

      const responseData = response.body;

      expect(responseData.status)
        .toBe(false);

      expect(responseData.error)
        .toBeDefined();

      expect(responseData.error)
        .toBeInstanceOf(Array);

      expect(responseData.error[0])
        .toMatch(/This username has been taken. Please select a different username./i);
    });

    it('should sign up with valid user data and respond success in json format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send(user1SignUpData)
        .expect('Content-Type', /json/)
        .expect(201);

      const responseData = response.body;

      expect(responseData.status)
        .toBe(true);

      expect(responseData.message)
        .toBeDefined();

      expect(responseData.message)
        .toMatch(/Registration successful. Please verify your email./i);
    });

    it('should create only one otp for the user on successful signup', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send(user3SignUpData)
        .expect('Content-Type', /json/)
        .expect(201);

      const responseData = response.body;

      expect(responseData.status)
        .toBe(true);

      expect(responseData.message)
        .toBeDefined();

      expect(responseData.message)
        .toMatch(/Registration successful. Please verify your email./i);

      await expect(OTP.find({
        email: user3SignUpData.email,
        purpose: config("auth.otp.types.SIGNUP.title")
      })).resolves.toHaveLength(1);
    });
  });

  describe('verifyAccount', () => {
    beforeEach(async () => {
      await User.deleteMany({}).exec();
    }, 10000);

    it('should return a bad response if the otp does not exist', async () => {
      await OTP.deleteMany({}).exec();

      const response = await request(app)
        .post('/api/v1/auth/account/verify')
        .send({
          email: user1SignUpData.email,
          otp: '123456'
        })
        .expect('Content-Type', /json/)
        .expect(400);

      const responseData = response.body;

      expect(responseData.status)
        .toBe(false);

      expect(responseData.error)
        .toBeDefined();

      expect(responseData.error)
        .toBeInstanceOf(Array);

      expect(responseData.error)
        .toContain(
          'Sorry. You have provided an invalid OTP.'
        );
    });

    it('should return a bad response if the user account does not exist', async () => {
      const user3Response = await request(app)
        .post('/api/v1/auth/signup')
        .send(user3SignUpData)
        .expect('Content-Type', /json/)
        .expect(201);

      await expect(OTP.find({
        email: user3SignUpData.email,
        purpose: config("auth.otp.types.SIGNUP.title")
      })).resolves.toHaveLength(1);

      // In test mode, we expect to have the OTP in the response
      expect(env('APP_MODE'))
        .toBe('test');

      expect(user3Response.body.data)
        .toHaveProperty('data.otp');

      const otp = user3Response.body.data.data.otp;

      const response = await request(app)
        .post('/api/v1/auth/account/verify')
        .send({
          email: user1SignUpData.email,
          otp
        })
        .expect('Content-Type', /json/)
        .expect(400);

      const responseData = response.body;

      expect(responseData.status)
        .toBe(false);

      expect(responseData.error)
        .toBeDefined();

      expect(responseData.error)
        .toBeInstanceOf(Array);

      expect(responseData.error)
        .toContain(
          'Sorry. You have provided an invalid OTP.'
        );
    });

    it('should return a bad response if the otp was meant for another user', async () => {
      const user3Response = await request(app)
        .post('/api/v1/auth/signup')
        .send(user3SignUpData)
        .expect('Content-Type', /json/)
        .expect(201);

      await expect(OTP.find({
        email: user3SignUpData.email,
        purpose: config("auth.otp.types.SIGNUP.title")
      })).resolves.toHaveLength(1);

      // In test mode, we expect to have the OTP in the response
      expect(env('APP_MODE'))
        .toBe('test');

      expect(user3Response.body.data)
        .toHaveProperty('data.otp');

      const otp = user3Response.body.data.data.otp;

      await request(app)
        .post('/api/v1/auth/signup')
        .send(user1SignUpData)
        .expect('Content-Type', /json/)
        .expect(201);

      const response = await request(app)
        .post('/api/v1/auth/account/verify')
        .send({
          email: user1SignUpData.email,
          otp
        })
        .expect('Content-Type', /json/)
        .expect(400);

      const responseData = response.body;

      expect(responseData.status)
        .toBe(false);

      expect(responseData.error)
        .toBeDefined();

      expect(responseData.error)
        .toBeInstanceOf(Array);

      expect(responseData.error)
        .toContain(
          'Sorry. You have provided an invalid OTP. Please retry.'
        );
    }, 40000);

    it('should return a bad response if the otp has expired', async () => {
      const user2Response = await request(app)
        .post('/api/v1/auth/signup')
        .send(user2SignUpData)
        .expect('Content-Type', /json/)
        .expect(201);

      await expect(OTP.find({
        email: user2SignUpData.email,
        purpose: config("auth.otp.types.SIGNUP.title")
      })).resolves.toHaveLength(1);

      // In test mode, we expect to have the OTP in the response
      expect(env('APP_MODE'))
        .toBe('test');

      expect(user2Response.body.data)
        .toHaveProperty('data.otp');

      const otp = user2Response.body.data.data.otp;
      const millisecondTimeUnit = config(
        "auth.otp.timeUnits.MILLISECONDS"
      );

      // Manually expire the otp so that we can verify
      await expect(OTP.findOneAndUpdate(
        {
          email: user2SignUpData.email,
          purpose: config("auth.otp.types.SIGNUP.title")
        },
        {
          timeUnit: millisecondTimeUnit
        },
        {
          new: true
        }
      )).resolves.toHaveProperty(
        'timeUnit', millisecondTimeUnit
      );

      const response = await request(app)
        .post('/api/v1/auth/account/verify')
        .send({
          email: user2SignUpData.email,
          otp
        })
        .expect('Content-Type', /json/)
        .expect(400);

      const responseData = response.body;

      expect(responseData.status)
        .toBe(false);

      expect(responseData.error)
        .toBeDefined();

      expect(responseData.error)
        .toBeInstanceOf(Array);

      expect(responseData.error)
        .toContain(
          'Sorry. Your OTP has expired.'
        );
    });

    it('should return a bad response if the otp is incorrect', async () => {
      const user1Response = await request(app)
        .post('/api/v1/auth/signup')
        .send(user1SignUpData)
        .expect('Content-Type', /json/)
        .expect(201);

      await expect(OTP.find({
        email: user1SignUpData.email,
        purpose: config("auth.otp.types.SIGNUP.title")
      })).resolves.toHaveLength(1);

      // In test mode, we expect to have the OTP in the response
      expect(env('APP_MODE'))
        .toBe('test');

      expect(user1Response.body.data)
        .toHaveProperty('data.otp');

      const otp = user1Response.body.data.data.otp;

      const response = await request(app)
        .post('/api/v1/auth/account/verify')
        .send({
          email: user1SignUpData.email,
          otp: 'INVALID'
        })
        .expect('Content-Type', /json/)
        .expect(400);

      const responseData = response.body;

      expect(responseData.status)
        .toBe(false);

      expect(responseData.error)
        .toBeDefined();

      expect(responseData.error)
        .toBeInstanceOf(Array);

      expect(responseData.error)
        .toContain(
          'Sorry. You have provided an invalid OTP. Please retry.'
        );
    });

    it('should return a success response if the otp is correct for the user, and delete all signup otps for the user', async () => {
      const signupResponse = await request(app)
        .post('/api/v1/auth/signup')
        .send(user3SignUpData)
        .expect('Content-Type', /json/)
        .expect(201);

      await expect(OTP.find({
        email: user3SignUpData.email,
        purpose: config("auth.otp.types.SIGNUP.title")
      })).resolves.toHaveLength(1);

      // In test mode, we expect to have the OTP in the response
      expect(env('APP_MODE'))
        .toBe('test');

      expect(signupResponse.body.data)
        .toHaveProperty('data.otp');

      const otp = signupResponse.body.data.data.otp;

      const response = await request(app)
        .post('/api/v1/auth/account/verify')
        .send({
          email: user3SignUpData.email,
          otp
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const responseData = response.body;

      expect(responseData.status)
        .toBe(true);

      expect(responseData.message)
        .toBeDefined();

      expect(responseData.message)
        .toMatch(
          /Account verification successful. Please sign in./
        );

      let activatedUser = await User.findOne({
        email: user3SignUpData.email
      });

      expect(activatedUser)
        .toBeInstanceOf(mongoose.Document);

      activatedUser = activatedUser.toJSON();

      expect(activatedUser.status)
        .toBe(config(
          "auth.account.statuses.ACTIVE"
        ));

      expect(activatedUser.isActive)
        .toBe(true);

      await expect(OTP.find({
        email: user3SignUpData.email,
        purpose: config("auth.otp.types.SIGNUP.title")
      })).resolves.toHaveLength(0);
    });
  });

  describe('signIn', () => {
    beforeEach(async () => {
      await User.deleteMany({}).exec();
    });

    it('should return a bad response if the user does not exist', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(user1SignInCreds)
        .expect('Content-Type', /json/)
        .expect(400);

      const responseData = response.body;

      expect(responseData.status)
        .toBe(false);

      expect(responseData.error)
        .toBeDefined();

      expect(responseData.error)
        .toBeInstanceOf(Array);

      expect(responseData.error)
        .toContain(
          'Your credentials do not match our records.'
        );
    });

    it('should return a bad response if the user account status=inactive', async () => {
      await request(app)
        .post('/api/v1/auth/signup')
        .send(user1SignUpData)
        .expect('Content-Type', /json/)
        .expect(201);

      await User.findOneAndUpdate(
        {
          email: user1SignUpData.email
        },
        {
          status: config(
            "auth.account.statuses.INACTIVE"
          ),
          isActive: true,
        },
        {
          new: true
        }
      );

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(user1SignInCreds)
        .expect('Content-Type', /json/)
        .expect(400);

      const responseData = response.body;

      expect(responseData.status)
        .toBe(false);

      expect(responseData.error)
        .toBeDefined();

      expect(responseData.error)
        .toBeInstanceOf(Array);

      expect(responseData.error)
        .toContain(
          'Your account has been blocked. Please contact the admin through support@shippa.com'
        );
    });

    it('should return a bad response if the user account is inactive', async () => {
      await request(app)
        .post('/api/v1/auth/signup')
        .send(user2SignUpData)
        .expect('Content-Type', /json/)
        .expect(201);

      await expect(User.findOne({
        email: user2SignUpData.email
      })).resolves.toHaveProperty(
        'isActive',
        false
      );

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(user2SignInCreds)
        .expect('Content-Type', /json/)
        .expect(400);

      const responseData = response.body;

      expect(responseData.status)
        .toBe(false);

      expect(responseData.error)
        .toBeDefined();

      expect(responseData.error)
        .toBeInstanceOf(Array);

      expect(responseData.error)
        .toContain(
          'Your account has been blocked. Please contact the admin through support@shippa.com'
        );
    });

    it('should return a bad response if the password is incorrect', async () => {
      await request(app)
        .post('/api/v1/auth/signup')
        .send(user1SignUpData)
        .expect('Content-Type', /json/)
        .expect(201);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          ...user1SignInCreds,
          password: user1SignInCreds.password + 'blah'
        })
        .expect('Content-Type', /json/)
        .expect(400);

      const responseData = response.body;

      expect(responseData.status)
        .toBe(false);

      expect(responseData.error)
        .toBeDefined();
    });

    it('should sign the activated user in and create only one sign-in otp for the user', async () => {
      await request(app)
        .post('/api/v1/auth/signup')
        .send(user2SignUpData)
        .expect('Content-Type', /json/)
        .expect(201);

      // Manually activate the user's account for testing
      await User.findOneAndUpdate(
        {
          email: user2SignUpData.email
        },
        {
          status: config(
            "auth.account.statuses.ACTIVE"
          ),
          isActive: true,
        },
        {
          new: true
        }
      );

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(user2SignInCreds)
        .expect('Content-Type', /json/)
        .expect(200);

      const responseData = response.body;

      expect(responseData.status)
        .toBe(true);

      await expect(OTP.find({
        email: user2SignUpData.email,
        purpose: config("auth.otp.types.LOGIN.title")
      })).resolves.toHaveLength(1);
    });
  });

  describe('verifySignIn', () => {
    beforeEach(async () => {
      await User.deleteMany({}).exec();
    });

    it('should return a bad response if the otp does not exist', async () => {
      await OTP.deleteMany({}).exec();

      const response = await request(app)
        .post('/api/v1/auth/login/verify')
        .send({
          email: user1SignUpData.email,
          otp: '123456'
        })
        .expect('Content-Type', /json/)
        .expect(400);

      const responseData = response.body;

      expect(responseData.status)
        .toBe(false);

      expect(responseData.error)
        .toBeDefined();

      expect(responseData.error)
        .toBeInstanceOf(Array);

      expect(responseData.error)
        .toContain(
          'Sorry. You have provided an invalid OTP.'
        );
    });

    it('should return a bad response if the user account does not exist', async () => {
      await request(app)
        .post('/api/v1/auth/signup')
        .send(user3SignUpData)
        .expect('Content-Type', /json/)
        .expect(201);

      // Manually activate the user's account
      await User.findOneAndUpdate(
        {
          email: user3SignUpData.email
        },
        {
          status: config(
            "auth.account.statuses.ACTIVE"
          ),
          isActive: true,
        },
        {
          new: true
        }
      );

      const signInResponse = await request(app)
        .post('/api/v1/auth/login')
        .send(user3SignInCreds)
        .expect('Content-Type', /json/)
        .expect(200);

      await expect(OTP.find({
        email: user3SignUpData.email,
        purpose: config("auth.otp.types.LOGIN.title")
      })).resolves.toHaveLength(1);

      // In test mode, we expect to have the OTP in the response
      expect(env('APP_MODE'))
        .toBe('test');

      expect(signInResponse.body.data)
        .toHaveProperty('data.otp');

      const otp = signInResponse.body.data.data.otp;

      const response = await request(app)
        .post('/api/v1/auth/login/verify')
        .send({
          email: user1SignUpData.email,
          otp
        })
        .expect('Content-Type', /json/)
        .expect(400);

      const responseData = response.body;

      expect(responseData.status)
        .toBe(false);

      expect(responseData.error)
        .toBeDefined();

      expect(responseData.error)
        .toBeInstanceOf(Array);

      expect(responseData.error)
        .toContain(
          'Sorry. You have provided an invalid OTP.'
        );
    });

    it('should return a bad response if the otp was meant for another user', async () => {
      await request(app)
        .post('/api/v1/auth/signup')
        .send(user2SignUpData)
        .expect('Content-Type', /json/)
        .expect(201);

      await request(app)
        .post('/api/v1/auth/signup')
        .send(user1SignUpData)
        .expect('Content-Type', /json/)
        .expect(201);

      // Manually activate both user accounts
      await User.updateMany(
        {
          isActive: false
        },
        {
          status: config("auth.account.statuses.ACTIVE"),
          isActive: true
        },
        {
          new: true
        }
      );

      // Sign in both users but take only the otp of the second user
      await request(app)
        .post('/api/v1/auth/login')
        .send(user1SignInCreds)
        .expect('Content-Type', /json/)
        .expect(200);

      const signInResponse = await request(app)
        .post('/api/v1/auth/login')
        .send(user2SignInCreds)
        .expect('Content-Type', /json/)
        .expect(200);

      await expect(OTP.find({
        email: user2SignUpData.email,
        purpose: config("auth.otp.types.LOGIN.title")
      })).resolves.toHaveLength(1);

      // In test mode, we expect to have the OTP in the response
      expect(env('APP_MODE'))
        .toBe('test');

      expect(signInResponse.body.data)
        .toHaveProperty('data.otp');

      const otp = signInResponse.body.data.data.otp;

      // Attempt to verify user1's login with user2's otp
      const response = await request(app)
        .post('/api/v1/auth/login/verify')
        .send({
          email: user1SignUpData.email,
          otp
        })
        .expect('Content-Type', /json/)
        .expect(400);

      const responseData = response.body;

      expect(responseData.status)
        .toBe(false);

      expect(responseData.error)
        .toBeDefined();

      expect(responseData.error)
        .toBeInstanceOf(Array);

      expect(responseData.error)
        .toContain(
          'Sorry. You have provided an invalid OTP. Please retry.'
        );
    });

    it('should return a bad response if the otp has expired', async () => {
      await request(app)
        .post('/api/v1/auth/signup')
        .send(user3SignUpData)
        .expect('Content-Type', /json/)
        .expect(201);

      // Manually activate the user's account
      await User.updateMany(
        {
          email: user3SignUpData.email
        },
        {
          status: config("auth.account.statuses.ACTIVE"),
          isActive: true
        },
        {
          new: true
        }
      );

      const signInResponse = await request(app)
        .post('/api/v1/auth/login')
        .send(user3SignInCreds)
        .expect('Content-Type', /json/)
        .expect(200);

      await expect(OTP.find({
        email: user3SignUpData.email,
        purpose: config("auth.otp.types.LOGIN.title")
      })).resolves.toHaveLength(1);

      // In test mode, we expect to have the OTP in the response
      expect(env('APP_MODE'))
        .toBe('test');

      expect(signInResponse.body.data)
        .toHaveProperty('data.otp');

      const otp = signInResponse.body.data.data.otp;
      const millisecondTimeUnit = config(
        "auth.otp.timeUnits.MILLISECONDS"
      );

      // Manually expire the otp so that we can verify
      await expect(OTP.findOneAndUpdate(
        {
          email: user3SignUpData.email,
          purpose: config("auth.otp.types.LOGIN.title")
        },
        {
          timeUnit: millisecondTimeUnit
        },
        {
          new: true
        }
      )).resolves.toHaveProperty(
        'timeUnit', millisecondTimeUnit
      );

      // Use the expired otp to verify the login
      const response = await request(app)
        .post('/api/v1/auth/login/verify')
        .send({
          email: user3SignUpData.email,
          otp
        })
        .expect('Content-Type', /json/)
        .expect(400);

      const responseData = response.body;

      expect(responseData.status)
        .toBe(false);

      expect(responseData.error)
        .toBeDefined();

      expect(responseData.error)
        .toBeInstanceOf(Array);

      expect(responseData.error)
        .toContain(
          'Sorry. Your OTP has expired.'
        );
    });

    it('should return a bad response if the otp is incorrect', async () => {
      await request(app)
        .post('/api/v1/auth/signup')
        .send(user2SignUpData)
        .expect('Content-Type', /json/)
        .expect(201);

      // Manually activate the user's account
      await User.updateMany(
        {
          email: user2SignUpData.email
        },
        {
          status: config("auth.account.statuses.ACTIVE"),
          isActive: true
        },
        {
          new: true
        }
      );

      const signInResponse = await request(app)
        .post('/api/v1/auth/login')
        .send(user2SignInCreds)
        .expect('Content-Type', /json/)
        .expect(200);

      await expect(OTP.find({
        email: user2SignUpData.email,
        purpose: config("auth.otp.types.LOGIN.title")
      })).resolves.toHaveLength(1);

      // In test mode, we expect to have the OTP in the response
      expect(env('APP_MODE'))
        .toBe('test');

      expect(signInResponse.body.data)
        .toHaveProperty('data.otp');

      const otp = signInResponse.body.data.data.otp;

      // Use an incorrect otp to verify the login
      const response = await request(app)
        .post('/api/v1/auth/login/verify')
        .send({
          email: user2SignUpData.email,
          otp: 'INVALID'
        })
        .expect('Content-Type', /json/)
        .expect(400);

      const responseData = response.body;

      expect(responseData.status)
        .toBe(false);

      expect(responseData.error)
        .toBeDefined();

      expect(responseData.error)
        .toBeInstanceOf(Array);

      expect(responseData.error)
        .toContain(
          'Sorry. You have provided an invalid OTP. Please retry.'
        );
    });

    it('should return a success response if the otp is correct for the user, and delete all login otps for the user', async () => {
      await request(app)
        .post('/api/v1/auth/signup')
        .send(user1SignUpData)
        .expect('Content-Type', /json/)
        .expect(201);

      // Manually activate the user's account
      await User.findOneAndUpdate(
        {
          email: user1SignUpData.email
        },
        {
          status: config("auth.account.statuses.ACTIVE"),
          isActive: true
        },
        {
          new: true
        }
      );

      const signInResponse = await request(app)
        .post('/api/v1/auth/login')
        .send(user1SignInCreds)
        .expect('Content-Type', /json/)
        .expect(200);

      await expect(OTP.find({
        email: user1SignUpData.email,
        purpose: config("auth.otp.types.LOGIN.title")
      })).resolves.toHaveLength(1);

      // In test mode, we expect to have the OTP in the response
      expect(env('APP_MODE'))
        .toBe('test');

      expect(signInResponse.body.data)
        .toHaveProperty('data.otp');

      const otp = signInResponse.body.data.data.otp;

      // Use the otp to verify the login
      const response = await request(app)
        .post('/api/v1/auth/login/verify')
        .send({
          email: user1SignUpData.email,
          otp
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const responseData = response.body;

      expect(responseData.status)
        .toBe(true);

      expect(responseData.message)
        .toBeDefined();

      expect(responseData.message)
        .toMatch(/You have successfully logged in./i);

      await expect(OTP.find({
        email: user1SignUpData.email,
        purpose: config("auth.otp.types.LOGIN.title")
      })).resolves.toHaveLength(0);

      expect(responseData.data)
        .toBeInstanceOf(Object);

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
        'lastLoginExpressive',
        'accessToken',
        'refreshToken'
      ];

      expect(Object.keys(responseData.data))
        .toEqual(
          expect.arrayContaining(props)
        );
    });
  });

  describe('me', () => {
    beforeEach(async () => {
      await User.deleteMany({}).exec();
    });

    it('should return a bad response if the authorization is not provided', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect('Content-Type', /json/)
        .expect(401);

      const responseData = response.body;

      expect(responseData.status)
        .toBe(false);

      expect(responseData.error)
        .toBeDefined();

      expect(responseData.error)
        .toBeInstanceOf(Array);

      expect(responseData.error)
        .toContain(
          'Unauthorized. It appears you do not have the appropriate rights to access this resource.'
        );
    });

    it('should return a bad response if the authorization is invalid', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'INVALID')
        .expect('Content-Type', /json/)
        .expect(401);

      const responseData = response.body;

      console.log(responseData);

      expect(responseData.status)
        .toBe(false);

      expect(responseData.error)
        .toBeDefined();

      expect(responseData.error)
        .toBeInstanceOf(Array);

      expect(responseData.error)
        .toContain(
          'Unauthenticated. Please sign in.'
        );
    });

    it('should return a success response if the user is signed in', async () => {
      // Manually create and activate a user account
      await request(app)
        .post('/api/v1/auth/signup')
        .send(user2SignUpData)
        .expect('Content-Type', /json/)
        .expect(201);

      // Manually activate the user's account
      await User.findOneAndUpdate(
        {
          email: user2SignUpData.email
        },
        {
          status: config("auth.account.statuses.ACTIVE"),
          isActive: true
        },
        {
          new: true
        }
      );

      const signInResponse = await request(app)
        .post('/api/v1/auth/login')
        .send(user2SignInCreds)
        .expect('Content-Type', /json/)
        .expect(200);

      await expect(OTP.find({
        email: user2SignUpData.email,
        purpose: config("auth.otp.types.LOGIN.title")
      })).resolves.toHaveLength(1);

      // In test mode, we expect to have the OTP in the response
      expect(env('APP_MODE'))
        .toBe('test');

      expect(signInResponse.body.data)
        .toHaveProperty('data.otp');

      const otp = signInResponse.body.data.data.otp;

      // Use the otp to verify the login
      const verifyLoginResponse = await request(app)
        .post('/api/v1/auth/login/verify')
        .send({
          email: user2SignUpData.email,
          otp
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(verifyLoginResponse.body)
        .toHaveProperty('data.accessToken');

      const accessToken = verifyLoginResponse.body.data.accessToken;

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      const responseData = response.body;

      expect(responseData.status)
        .toBe(true);

      expect(responseData.data)
        .toBeInstanceOf(Object);

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
        'lastLoginExpressive',
      ];

      expect(Object.keys(responseData.data))
        .toEqual(
          expect.arrayContaining(props)
        );
    }, 40000);
  });
});