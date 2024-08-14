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
        .toMatch(/The password confirmation must match the password./i);
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
  });
});