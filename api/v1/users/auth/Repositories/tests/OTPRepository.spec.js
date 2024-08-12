const mongoose = require('mongoose');
const Commons = require('../../../../../helpers/commons');
const OTPRepository = require('../OTPRepository');
const OTP = require('../../Models/OTP');

const env = (new Commons()).env;
const config = (new Commons()).config;

describe('OTPRepository', () => {
  let otpRepository;

  const uri = `mongodb://${env('TEST_DB_HOST')}:${env('TEST_DB_PORT')}/${env('TEST_DB_NAME')}`;

  beforeAll(async () => {
    await mongoose.connect(uri);

    otpRepository = new OTPRepository();
  }, 10000);

  afterAll(async () => {
    await mongoose.connection.close();
  }, 10000);

  it('should have the create method', () => {
    expect(otpRepository).toHaveProperty('create');
    expect(otpRepository.create).toBeInstanceOf(Function);
  });

  it('should have the update method', () => {
    expect(otpRepository).toHaveProperty('update');
    expect(otpRepository.update).toBeInstanceOf(Function);
  });

  it('should have the find method', () => {
    expect(otpRepository).toHaveProperty('find');
    expect(otpRepository.find).toBeInstanceOf(Function);
  });

  it('should have the findOne method', () => {
    expect(otpRepository).toHaveProperty('findOne');
    expect(otpRepository.findOne).toBeInstanceOf(Function);
  });

  it('should have the destroy method', () => {
    expect(otpRepository).toHaveProperty('destroy');
    expect(otpRepository.destroy).toBeInstanceOf(Function);
  });

  describe('create', () => {
    it('should throw error if called without the parameter or with invalid object', async () => {
      await expect(otpRepository.create())
        .rejects.toThrow(/required/i);

      await expect(otpRepository.create({}))
        .rejects.toThrow(/required/i);

      let otpData = {otp: '1234'};

      await expect(otpRepository.create(otpData))
        .rejects.toThrow();

      otpData = {
        ...otpData,
        user: new mongoose.Types.ObjectId(),
      };

      await expect(otpRepository.create(otpData))
        .rejects.toThrow();

      otpData = {
        ...otpData,
        purpose: "Logan" // invalid purpose
      };

      await expect(otpRepository.create(otpData))
        .rejects.toThrow();

      otpData = {
        ...otpData,
        purpose: config("auth.otp.types.LOGIN.title")
      };

      await expect(otpRepository.create(otpData))
        .rejects.toThrow();

      otpData = {
        ...otpData,
        email: undefined // invalid email
      };

      await expect(otpRepository.create(otpData))
        .rejects.toThrow();
    });

    it('should create an otp if called with valid data', async () => {
      const otpData = {
        otp: '1234',
        user: new mongoose.Types.ObjectId(),
        purpose: config("auth.otp.types.LOGIN.title"),
        email: 'john-doe@gmailcom',
        duration: 10
      };

      const minimumProps = Object.keys(otpData);
      const matchData = {...otpData};

      delete matchData.otp; // otp is encrypted so we cannot match the value

      await expect(otpRepository.create(otpData))
        .resolves.not.toThrow();

      const createResult = (await otpRepository.create(otpData)).toJSON();

      expect(Object.keys(createResult))
        .toEqual(expect.arrayContaining(minimumProps));

      expect(createResult)
        .toMatchObject(matchData);
    });
  });

  describe('find', () => {
    it('should throw an error if the filter parameter is invalid', async () => {
      await expect(otpRepository.find('string'))
        .rejects.toThrow(/parameter must be an object with key value pairs/i);

      await expect(otpRepository.find(10))
        .rejects.toThrow(/parameter must be an object with key value pairs/i);

      await expect(otpRepository.find(null))
        .rejects.toThrow(/parameter must be an object with key value pairs/i);

      await expect(otpRepository.find({user: 'user'}))
        .rejects.toThrow();
    });

    it('should always return a list of documents', async () => {
      const otpData = {
        otp: '1234',
        user: new mongoose.Types.ObjectId(),
        purpose: config("auth.otp.types.LOGIN.title"),
        email: 'john-doe@gmailcom',
        duration: 10
      };

      let filter = {
        email: otpData.email,
        purpose: otpData.purpose
      };

      await OTP.deleteMany(filter).exec();

      // When no matching filter, an array should still be returned
      await expect(otpRepository.find())
        .resolves.toBeInstanceOf(Array);

      // Let's create an otp and check again
      await expect(otpRepository.create(otpData))
        .resolves.not.toThrow();

      await expect(otpRepository.find(filter))
        .resolves.toBeInstanceOf(Array);

      await expect(otpRepository.find(filter))
        .resolves.not.toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should throw an error if the filter is invalid', async () => {
      await expect(otpRepository.findOne('string'))
        .rejects.toThrow(/parameter must be an object with key value pairs/i);

      await expect(otpRepository.findOne(10))
        .rejects.toThrow(/parameter must be an object with key value pairs/i);

      await expect(otpRepository.findOne(null))
        .rejects.toThrow(/parameter must be an object with key value pairs/i);
    });

    it('should return null if no matching data was found', async () => {
      const filter = {
        email: 'john-doe@gmail.com',
        purpose: config("auth.otp.types.LOGIN.title")
      };

      await OTP.deleteMany(filter).exec();

      await expect(otpRepository.findOne(filter))
        .resolves.toBeNull();
    });

    it('should return null or mongoose.Document but never return a list or array', async () => {
      await expect(otpRepository.findOne())
        .resolves.not.toBeInstanceOf(Array);

      await expect(otpRepository.create({
        otp: '1234',
        user: new mongoose.Types.ObjectId(),
        purpose: config("auth.otp.types.LOGIN.title"),
        email: 'john-doe@gmail.com',
        duration: 10
      })).resolves.not.toThrow();

      await expect(otpRepository.findOne({email: 'john-doe@gmail.com'}))
        .resolves.not.toBeInstanceOf(Array);

      await expect(otpRepository.findOne({email: 'john-doe@gmail.com'}))
        .resolves.toBeInstanceOf(mongoose.Document);
    });
  });

  describe('update', () => {
    it('should throw error if called without the filter parameter', async () => {
      await expect(otpRepository.update())
        .rejects.toThrow(/required/i);
    });

    it('should throw error if called without the update parameter', async () => {
      await expect(otpRepository.update({}))
        .rejects.toThrow(/required/i);
    });

    it('should throw error if the options parameter is not a valid object, or an array', async () => {
      await expect(otpRepository.update(
        {key: 'value'},
        {key: 'value'},
        'string'
      )).rejects.toThrow(/must be an object with key value pairs/i);

      await expect(otpRepository.update(
        {key: 'value'},
        {key: 'value'},
        10 // number
      )).rejects.toThrow(/must be an object with key value pairs/i);

      await expect(otpRepository.update(
        {key: 'value'},
        {key: 'value'},
        ['string'] // array
      )).rejects.toThrow(/must be an object with key value pairs/i);

      await expect(otpRepository.update(
        {key: 'value'},
        {key: 'value'},
        null
      )).rejects.toThrow(/must be an object with key value pairs/i);
    });

    it('should update the otp if called with valid data', async () => {
      const otpData = {
        otp: '1234',
        user: new mongoose.Types.ObjectId(),
        purpose: config("auth.otp.types.LOGIN.title"),
        email: 'john-doe@gmailcom',
        duration: 10
      };

      let filter = {
        email: otpData.email,
        purpose: otpData.purpose
      };

      await OTP.deleteMany(filter).exec();

      await expect(otpRepository.create(otpData))
        .resolves.not.toThrow();

      const update = {otp: '5678'};
      const options = {new: true};

      const updateResult = (await otpRepository.update(
        filter,
        update,
        options
      ));

      const matchData = {...otpData};
      delete matchData.otp; // otp is encrypted so we cannot match the value

      expect(updateResult).not.toBeNull();
      expect(updateResult).toMatchObject(matchData);
    });

    it('should update all the matching otps if called with valid data', async () => {
      const otpData = {
        otp: '1234',
        user: new mongoose.Types.ObjectId(),
        purpose: config("auth.otp.types.LOGIN.title"),
        email: 'john-doe@gmail.com',
        duration: 10
      };

      let filter = {
        email: otpData.email,
        purpose: otpData.purpose
      };

      await OTP.deleteMany(filter).exec();

      const otpsToCreate = 3;

      for(let i = 0; i < otpsToCreate; i++) {
        otpData.otp = Math.floor(Math.random() * 10000).toString() + 1000;

        await expect(otpRepository.create(otpData))
          .resolves.not.toThrow();
      }

      const update = {otp: '5678'};
      const options = {new: true};

      await otpRepository.update(
        filter,
        update,
        options,
        true
      );

      const matchData = {...otpData};
      delete matchData.otp; // otp is encrypted so we cannot match the value

      await expect(otpRepository.find(filter))
        .resolves.not.toBeNull();
      await expect(otpRepository.find(filter))
        .resolves.toHaveLength(otpsToCreate);
    });
  });

  describe('destroy', () => {
    it('should throw error if called without the filter parameter', async () => {
      await expect(otpRepository.destroy())
        .rejects.toThrow(/required/i);
    });

    it('should throw error if the filter parameter is not a valid object', async () => {
      await expect(otpRepository.destroy('string'))
        .rejects.toThrow(/required|parameter must be an object with key value pairs/i);

      await expect(otpRepository.destroy(10))
        .rejects.toThrow(/required|parameter must be an object with key value pairs/i);

      await expect(otpRepository.destroy(null))
        .rejects.toThrow(/required|parameter must be an object with key value pairs/i);
    });

    it('should destroy the first otp that matches the filter if called with valid data', async () => {
      const otpData = {
        otp: '1234',
        user: new mongoose.Types.ObjectId(),
        purpose: config("auth.otp.types.LOGIN.title"),
        email: 'john-doe@gmail.com'
      };

      let filter = {
        email: otpData.email,
        purpose: otpData.purpose
      };

      await OTP.deleteMany(filter).exec();

      await expect(otpRepository.create(otpData))
        .resolves.not.toThrow();

      await expect(otpRepository.findOne(filter))
        .resolves.toBeInstanceOf(mongoose.Document);

      await otpRepository.destroy(
        filter
      );

      await expect(otpRepository.findOne(filter))
        .resolves.toBeNull();
    });

    it('should destroy all otps matching the filter', async () => {
      const otpData = {
        otp: '1234',
        user: new mongoose.Types.ObjectId(),
        purpose: config("auth.otp.types.LOGIN.title"),
        email: 'john-doe@gmail.com'
      };

      let filter = {
        email: otpData.email,
        purpose: otpData.purpose
      };

      await OTP.deleteMany(filter).exec();

      const otpsToCreate = 2;

      for(let i = 0; i < otpsToCreate; i++) {
        otpData.otp = Math.floor(Math.random() * 10000).toString() + 1000;

        await expect(otpRepository.create(otpData))
          .resolves.not.toThrow();
      }

      await expect(otpRepository.find(filter))
        .resolves.toHaveLength(otpsToCreate); // Check creation success.

      await otpRepository.destroy(
        filter,
        true
      );

      await expect(otpRepository.find(filter))
        .resolves.not.toBeNull();
      await expect(otpRepository.find(filter))
        .resolves.toHaveLength(0);
    });
  });
});