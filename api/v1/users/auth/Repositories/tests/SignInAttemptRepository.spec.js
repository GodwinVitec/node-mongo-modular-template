const mongoose = require('mongoose');
const Commons = require('../../../../../helpers/commons');
const SignInAttempt = require('../../Models/SignInAttempt');
const SignInAttemptRepository = require("../SignInAttemptRepository");
const OTP = require("../../Models/OTP");

const commons = new Commons();
const env = commons.env;
const config = commons.config;

describe('SignInAttemptRepository', () => {
  let repository;

  const uri = `mongodb://${env('TEST_DB_HOST')}:${env('TEST_DB_PORT')}/${env('TEST_DB_NAME')}`;

  const validAttemptData = {
    user: new mongoose.Types.ObjectId(),
    ipAddress: '::2',
    username: 'john-doe',
    password: 'john-doe',
  };

  beforeAll(async () => {
    await mongoose.connect(uri);

    repository = new SignInAttemptRepository();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should have the create method', () => {
    expect(repository.create).toBeDefined();
    expect(repository.create).toBeInstanceOf(Function);
  });

  it('should have the update method', () => {
    expect(repository.update).toBeDefined();
    expect(repository.update).toBeInstanceOf(Function);
  });

  it('should have the count method', () => {
    expect(repository.count).toBeDefined();
    expect(repository.count).toBeInstanceOf(Function);
  });

  it('should have the destroy method', () => {
    expect(repository.destroy).toBeDefined();
    expect(repository.destroy).toBeInstanceOf(Function);
  });

  it('should have the find method', () => {
    expect(repository.find).toBeDefined();
    expect(repository.find).toBeInstanceOf(Function);
  });

  it('should have the findOne method', () => {
    expect(repository.findOne).toBeDefined();
    expect(repository.findOne).toBeInstanceOf(Function);
  });

  describe('create', () => {
    it('should throw error if called without the parameter or with invalid object', async () => {
      await expect(repository.create())
        .rejects.toThrow(/required/i);

      await expect(repository.create({}))
        .rejects.toThrow(/required/i);

      let attemptData = {
        user: new mongoose.Types.ObjectId(),
      };

      await expect(repository.create(attemptData))
        .rejects.toThrow();

      attemptData = {
        ...attemptData,
        ipAddress: "::1"
      };

      await expect(repository.create(attemptData))
        .rejects.toThrow();

      attemptData = {
        ...attemptData,
        username: 'john-doe'
      };

      await expect(repository.create(attemptData))
        .rejects.toThrow();
    });

    it('should create a sign-in-attempt if called with valid data', async () => {
      const minimumProps = Object.keys(validAttemptData);
      const matchData = {...validAttemptData};

      await expect(repository.create(validAttemptData))
        .resolves.not.toThrow();

      const createResult = (await repository.create(validAttemptData))
        .toJSON();

      expect(Object.keys(createResult))
        .toEqual(expect.arrayContaining(minimumProps));

      expect(createResult)
        .toMatchObject(matchData);
    });
  });

  describe('find', () => {
    it('should throw an error if the filter parameter is invalid', async () => {
      await expect(repository.find('string'))
        .rejects.toThrow(/required|parameter must be an object with key value pairs/i);

      await expect(repository.find(10))
        .rejects.toThrow(/required|parameter must be an object with key value pairs/i);

      await expect(repository.find(null))
        .rejects.toThrow(/required|parameter must be an object with key value pairs/i);

      await expect(repository.find({user: 'user'}))
        .rejects.toThrow();
    });

    it('should always return a list of documents', async () => {
      let filter = {
        username: validAttemptData.username,
        ipAddress: validAttemptData.ipAddress
      };

      await SignInAttempt.deleteMany(filter).exec();

      // When no matching filter, an array should still be returned
      await expect(repository.find())
        .resolves.toBeInstanceOf(Array);

      // Let's create an otp and check again
      await expect(repository.create(validAttemptData))
        .resolves.not.toThrow();

      await expect(repository.find(filter))
        .resolves.toBeInstanceOf(Array);

      await expect(repository.find(filter))
        .resolves.not.toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should throw an error if the filter is invalid', async () => {
      await expect(repository.findOne('string'))
        .rejects.toThrow(/required|parameter must be an object with key value pairs/i);

      await expect(repository.findOne(10))
        .rejects.toThrow(/required|parameter must be an object with key value pairs/i);

      await expect(repository.findOne(null))
        .rejects.toThrow(/required|parameter must be an object with key value pairs/i);
    });

    it('should return null if no matching data was found', async () => {
      let filter = {
        username: validAttemptData.username,
        ipAddress: validAttemptData.ipAddress
      };

      await SignInAttempt.deleteMany(filter).exec();

      await expect(repository.findOne(filter))
        .resolves.toBeNull();
    });

    it('should return null or mongoose.Document but never return a list or array', async () => {
      await expect(repository.findOne())
        .resolves.not.toBeInstanceOf(Array);

      await expect(repository.create(validAttemptData))
        .resolves.not.toThrow();

      let filter = {
        username: validAttemptData.username,
        ipAddress: validAttemptData.ipAddress
      };

      const result = await repository.findOne(filter);

      expect(result).not.toBeInstanceOf(Array);

      expect(result).toBeInstanceOf(mongoose.Document);

      expect(result).toMatchObject(validAttemptData);
    });
  });

  describe('update', () => {
    it('should throw error if called without the filter parameter', async () => {
      await expect(repository.update())
        .rejects.toThrow(/required/i);
    });

    it('should throw an error if the filter is invalid', async () => {
      await expect(repository.update('string'))
        .rejects.toThrow(/required|parameter must be an object with key value pairs/i);

      await expect(repository.update(10))
        .rejects.toThrow(/required|parameter must be an object with key value pairs/i);

      await expect(repository.update(null))
        .rejects.toThrow(/required|parameter must be an object with key value pairs/i);
    });

    it('should throw error if called without the update parameter', async () => {
      await expect(repository.update({key: 'value'}))
        .rejects.toThrow(/required/i);
    });

    it('should throw an error if the update is invalid', async () => {
      await expect(repository.update(
        {key: 'value'},
        'string'
      )).rejects.toThrow(
        /required|parameter must be an object with key value pairs/i
      );

      await expect(repository.update(
        {key: 'value'}, 10
      )) .rejects.toThrow(
        /required|parameter must be an object with key value pairs/i
      );

      await expect(repository.update(
        {key: 'value'}, null
      )) .rejects.toThrow(
        /required|parameter must be an object with key value pairs/i
      );
    });

    it('should throw error if the options parameter is not a valid object, or an array', async () => {
      await expect(repository.update(
        {key: 'value'},
        {key: 'value'},
        'string'
      )).rejects.toThrow(/must be an object with key value pairs/i);

      await expect(repository.update(
        {key: 'value'},
        {key: 'value'},
        10 // number
      )).rejects.toThrow(/must be an object with key value pairs/i);

      await expect(repository.update(
        {key: 'value'},
        {key: 'value'},
        ['string'] // array
      )).rejects.toThrow(/must be an object with key value pairs/i);

      await expect(repository.update(
        {key: 'value'},
        {key: 'value'},
        null
      )).rejects.toThrow(/must be an object with key value pairs/i);
    });

    it('should update the sign-in-attempt if called with valid data', async () => {
      let filter = {
        ipAddress: validAttemptData.ipAddress,
        username: validAttemptData.username
      };

      await SignInAttempt.deleteMany(filter).exec();

      await expect(repository.create(validAttemptData))
        .resolves.not.toThrow();

      const update = {ipAddress: '5:60:78'};
      const options = {new: true};

      const updateResult = await repository.update(
        filter,
        update,
        options
      );

      const matchData = {...validAttemptData, ...update};
      expect(updateResult).not.toBeNull();
      expect(updateResult).toMatchObject(matchData);
    });

    it('should update all matching sign-in-attempts if called with valid data', async () => {
      const update = {ipAddress: ':5:678'};
      const options = {new: true};

      let filter = {
        username: validAttemptData.username
      };

      await SignInAttempt.deleteMany(filter).exec();

      const attemptsToCreate = 3;

      for(let i = 0; i < attemptsToCreate; i++) {
        await expect(repository.create(validAttemptData))
          .resolves.not.toThrow();
      }

      await repository.update(
        filter,
        update,
        options,
        true
      );

      await expect(repository.find(filter))
        .resolves.not.toBeNull();
      await expect(repository.find(filter))
        .resolves.toHaveLength(attemptsToCreate);
    });
  });

  describe('destroy', () => {
    it('should throw error if called without the filter parameter', async () => {
      await expect(repository.destroy())
        .rejects.toThrow(/required/i);
    });

    it('should throw error if the filter parameter is not a valid object', async () => {
      await expect(repository.destroy('string'))
        .rejects.toThrow(/required|parameter must be an object with key value pairs/i);

      await expect(repository.destroy(10))
        .rejects.toThrow(/required|parameter must be an object with key value pairs/i);

      await expect(repository.destroy(null))
        .rejects.toThrow(/required|parameter must be an object with key value pairs/i);
    });

    it('should destroy the first sign-in-attempt that matches the filter if called with valid data', async () => {
      let filter = {
        ipAddress: validAttemptData.ipAddress,
        username: validAttemptData.username
      };

      await SignInAttempt.deleteMany(filter).exec();

      await expect(repository.create(validAttemptData))
        .resolves.not.toThrow();

      await expect(repository.findOne(filter))
        .resolves.toBeInstanceOf(mongoose.Document);

      await repository.destroy(
        filter
      );

      await expect(repository.findOne(filter))
        .resolves.toBeNull();
    });

    it('should destroy all sign-in-attempts matching the filter', async () => {
      let filter = {
        email: validAttemptData.email,
        purpose: validAttemptData.purpose
      };

      await SignInAttempt.deleteMany(filter).exec();

      const attemptsToCreate = 2;

      for(let i = 0; i < attemptsToCreate; i++) {
        await expect(repository.create(validAttemptData))
          .resolves.not.toThrow();
      }

      await expect(repository.find(filter))
        .resolves.toHaveLength(attemptsToCreate); // Check creation success.

      await repository.destroy(
        filter,
        true
      );

      await expect(repository.find(filter))
        .resolves.not.toBeNull();
      await expect(repository.find(filter))
        .resolves.toHaveLength(0);
    });
  });
});