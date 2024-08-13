const mongoose = require('mongoose');
const OTPService = require('../OTPService');
const OTP = require('../../Models/OTP');
const User = require('../../../self/Models/User');
const Commons = require("../../../../../helpers/commons");

const commons = new Commons();
const env = commons.env;
const config = commons.config;

describe('OTPService', () => {
  // Mock Data
  const user = {
    "_id": new mongoose.Types.ObjectId("66ab6eab8ce618569b25a238"),
    "firstName": "Kim",
    "lastName": "Johnson",
    "username": "kim-johnson",
    "password": "$2a$10$viqYYteq",
    "email": "kim-johnson@preston.org",
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

  let otpService;

  const uri = `mongodb://${env('TEST_DB_HOST')}:${env('TEST_DB_PORT')}/${env('TEST_DB_NAME')}`;

  beforeAll(async () => {
    await mongoose.connect(uri);

    otpService = new OTPService();
  }, 100000);

  afterAll(async () => {
    await mongoose.connection.close();
  }, 100000);

  describe('repository', () => {
    it('should be a private property', () => {
      expect(otpService.repository).toBeUndefined();
    });
  });

  describe('userService', () => {
    it('should be a private property', () => {
      expect(otpService.userService).toBeUndefined();
    });
  });

  describe('commonHelper', () => {
    it('should be a private property', () => {
      expect(otpService.commonHelper).toBeUndefined();
    });
  });

  describe('generate', () => {
    it('should be a publicly available method', () => {
      expect(otpService.generate).toBeDefined();

      expect(otpService.generate).toBeInstanceOf(Function);
    });

    it('should always return a string', () => {
      // We will make 20 runs for the generate function.
      for(let i = 0; i < 20; i++) {
        expect(typeof otpService.generate())
          .toBe('string');
      }
    });

    it('should always return a 6-digit numeric string', () => {
      // We will make 20 runs for the generate function.
      for(let i = 0; i < 20; i++) {
        const otp = otpService.generate();

        expect(otp).toMatch(/^[0-9]{6}$/);
      }
    });


    const runs = 10000;
    const expectedPass = 0.993 * runs;

    it(`should produce unique 6-digit numeric string for at least ${expectedPass} in ${runs} consecutive times at least once in three runs`, () => {
      const otpSet1 = [];
      const otpSet2 = [];
      const otpSet3 = [];

      for(let i = 0; i < runs; i++) {
        otpSet1.push(otpService.generate());
      }

      for(let i = 0; i < runs; i++) {
        otpSet2.push(otpService.generate());
      }

      for(let i = 0; i < runs; i++) {
        otpSet3.push(otpService.generate());
      }

      const uniqueOtpSet1 = new Set(otpSet1);
      const uniqueOtpSet2 = new Set(otpSet2);
      const uniqueOtpSet3 = new Set(otpSet3);

      const passed = uniqueOtpSet1.size >= expectedPass ||
        uniqueOtpSet2.size >= expectedPass || uniqueOtpSet3.size >= expectedPass;

      expect(passed).toBe(true);
    });
  });

  describe('create', () => {
    it('should be a publicly available method', () => {
      expect(otpService.create).toBeDefined();

      expect(otpService.create).toBeInstanceOf(Function);
    });

    it('should return an error response if an invalid user data is supplied', async () => {
      await expect(otpService.create({}, "Login"))
        .resolves.toHaveProperty(
          'status',
          false
        );

      await expect(otpService.create({
        email: 'jd@m.com'
      }, "Login")).resolves.toHaveProperty(
        'status',
        false
      );

      await expect(otpService.create({
        _id: 'jd@m.com'
      }, "Login")).resolves.toHaveProperty(
        'status',
        false
      );

    });

    it('should return an error response if an invalid purpose is supplied', async () => {
      await expect(otpService.create(user, "InvalidPurpose"))
        .resolves.toHaveProperty(
          'status',
          false
        );
    });

    it('should return an error response if an invalid duration is supplied', async () => {
      await expect(otpService.create(
        user,
        otpData.purpose,
        'string'
      )).resolves.toHaveProperty(
          'status',
          false
        );

      await expect(otpService.create(
        user,
        otpData.purpose,
        ['string']
      )).resolves.toHaveProperty(
          'status',
          false
        );

      await expect(otpService.create(
        user,
        otpData.purpose,
        {key: 'value'}
      )).resolves.toHaveProperty(
          'status',
          false
        );
    });

    it('should return an error response if an invalid time unit is supplied', async () => {
      await expect(otpService.verify(
        user.email,
        otpData.purpose,
        otpData.duration,
        'Invalid Time unit'
      )).resolves.toHaveProperty(
        'status',
        false
      );
    });

    it('should return an error response if the user does not exist', async () => {
      await User.deleteMany({email: user.email}).exec();

      await expect(otpService.create(
        user,
        otpData.purpose,
        otpData.duration
      )).resolves.toHaveProperty(
        'status',
        false
      );
    });

    it('should return a success response if a valid user data is supplied', async () => {
      await User.deleteMany({email: user.email}).exec();

      const newUser = await User.create(user);

      await expect(otpService.create(
        newUser,
        otpData.purpose,
        otpData.duration
      )).resolves.not.toThrow();

      await expect(otpService.create(
        newUser,
        otpData.purpose,
        otpData.duration
      )).resolves.toHaveProperty(
        'status',
        true
      );
    });

    it('should leave only one instance of an otp for each purpose for each user', async () => {
      await User.deleteMany({email: user.email}).exec();

      const newUser = await User.create(user);

      // Make three runs and expect one
      for(let i = 0; i < 2; i++) {
        await expect(otpService.create(
          newUser,
          otpData.purpose,
          otpData.duration
        )).resolves.not.toThrow();
      }

      const results = await OTP.find({
        user: newUser._id,
        purpose: otpData.purpose
      }).exec();

      await expect(results).toHaveLength(1);
    });
  });

  describe('verify', () => {
    it('should be a publicly available method', () => {
      expect(otpService.verify).toBeDefined();

      expect(otpService.verify).toBeInstanceOf(Function);
    });

    it('should return an error response if an invalid purpose is supplied', async () => {
      await expect(otpService.verify('123456', user.email, 'InvalidPurpose'))
        .resolves.toHaveProperty(
          'status',
          false
        );
    });

    it('should return an error response if an invalid otp is supplied', async () => {
      // First delete the matching otp data in the db to be sure
      await OTP.deleteMany({
        email: user.email,
        purpose: otpData.purpose
      }).exec();

      await expect(otpService.verify(otpData.otp, user.email, otpData.purpose))
        .resolves.toHaveProperty(
          'status',
          false
        );
    });

    it('should return an error response if the user does not exist', async () => {
      // First we create the otp with the user
      await User.deleteMany({email: user.email}).exec();

      const newUser = await User.create(user);

      await expect(otpService.create(
        newUser,
        otpData.purpose,
        otpData.duration
      )).resolves.not.toThrow();

      // Then remove the user
      await User.deleteMany({email: user.email}).exec();

      await expect(otpService.verify(
        otpData.otp,
        user.email,
        otpData.purpose
      )).resolves.toHaveProperty(
          'status',
          false
        );
    });

    it('should return an error response if the otp was created for a different user', async () => {
      await User.deleteMany({email: user.email}).exec();
      await User.deleteMany({email: user2.email}).exec();

      const newUser1 = await User.create(user);
      const newUser2 = await User.create(user2);

      const newOtpResponse = await otpService.create(
        newUser1,
        otpData.purpose,
        otpData.duration,
        config("auth.otp.timeUnits.SECONDS")
      );

      const newOtp = newOtpResponse.data.otp;

      await expect(otpService.verify(
        newOtp,
        newUser2.email,
        otpData.purpose
      )).resolves.toHaveProperty(
        'status',
        false
      );
    });

    it('should return an error response if the otp has expired', async () => {
      await User.deleteMany({email: user.email}).exec();

      const newUser = await User.create(user);

      const newOtpResponse = await otpService.create(
        newUser,
        otpData.purpose,
        otpData.duration,
        config("auth.otp.timeUnits.MILLISECONDS")
      );

      // Check that the otp was created.
      await expect(OTP.findOne({
        email: newUser.email,
        purpose: otpData.purpose,
        duration: otpData.duration,
        timeUnit: config("auth.otp.timeUnits.MILLISECONDS")
      })).resolves.toBeInstanceOf(mongoose.Document);

      const newOtp = newOtpResponse.data.otp;
      const verifyOtpResponse = await otpService.verify(
        newOtp,
        newUser.email,
        otpData.purpose
      );

      expect(verifyOtpResponse).toHaveProperty(
        'status',
        false
      );

      expect(verifyOtpResponse.errors.length)
        .toBeGreaterThan(0);

      expect(verifyOtpResponse.errors[0])
        .toMatch(/expired/i);
    });

    it('should return an error response if the otp is incorrect', async () => {
      await User.deleteMany({email: user.email}).exec();

      const newUser = await User.create(user);

      const newOtpResponse = await otpService.create(
        newUser,
        otpData.purpose,
        otpData.duration,
        config("auth.otp.timeUnits.MINUTES")
      );

      // Check that the otp was created.
      await expect(OTP.findOne({
        email: newUser.email,
        purpose: otpData.purpose,
        duration: otpData.duration,
        timeUnit: config("auth.otp.timeUnits.MINUTES")
      })).resolves.toBeInstanceOf(mongoose.Document);

      const verifyOtpResponse = await otpService.verify(
        otpData.otp,
        newUser.email,
        otpData.purpose
      );

      expect(verifyOtpResponse).toHaveProperty(
        'status',
        false
      );

      expect(verifyOtpResponse.errors.length)
        .toBeGreaterThan(0);

      expect(verifyOtpResponse.errors[0])
        .toMatch(/invalid/i);
    });


    it('should return a success response if the otp verification was successful', async () => {
      await User.deleteMany({email: user.email}).exec();

      const newUser = await User.create(user);

      const newOtpResponse = await otpService.create(
        newUser,
        otpData.purpose,
        otpData.duration,
        config("auth.otp.timeUnits.MINUTES")
      );

      // Check that the otp was created.
      await expect(OTP.findOne({
        email: newUser.email,
        purpose: otpData.purpose,
        duration: otpData.duration,
        timeUnit: config("auth.otp.timeUnits.MINUTES")
      })).resolves.toBeInstanceOf(mongoose.Document);

      const newOtp = newOtpResponse.data.otp;
      const verifyOtpResponse = await otpService.verify(
        newOtp,
        newUser.email,
        otpData.purpose
      );

      expect(verifyOtpResponse).toHaveProperty(
        'status',
        true
      );

      expect(verifyOtpResponse.errors)
        .toBeUndefined();

      expect(verifyOtpResponse.message)
        .toMatch(/verified/i);
    });
  });
});