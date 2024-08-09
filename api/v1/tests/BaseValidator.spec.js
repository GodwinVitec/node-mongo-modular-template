const BaseValidator = require('../BaseValidator');

describe('BaseValidator', () => {
  let baseValidator;

  beforeAll(() => {
    baseValidator = new BaseValidator();
  });

  test('should contain the validator method', () => {
    expect(baseValidator).toHaveProperty('validator');
    expect(baseValidator.validator).toBeInstanceOf(Function);
  });

  test('should contain the validationError method', () => {
    expect(baseValidator).toHaveProperty('validationError');
    expect(baseValidator.validationError).toBeInstanceOf(Function);
  });

  test('should contain the rules method', () => {
    expect(baseValidator).toHaveProperty('rules');
    expect(baseValidator.rules).toBeInstanceOf(Function);
  });

  test('should contain the customMessages method', () => {
    expect(baseValidator).toHaveProperty('customMessages');
    expect(baseValidator.customMessages).toBeInstanceOf(Function);
  });

  test('should contain the validate method', () => {
    expect(baseValidator).toHaveProperty('validate');
    expect(baseValidator.validate).toBeInstanceOf(Function);
  });

  describe('validator', () => {
    it('should validate the body against the rules and return the status and errors', () => {
      const body = { key: 'value' };
      const rules = { key: 'required' };
      const customMessages = {};
      const callback = jest.fn();

      baseValidator.validator(body, rules, customMessages, callback);

      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(null, true);
    });
  });

  describe('validationError', () => {
    it('should send a validation error response with the provided error', () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
      const err = {errors: ['value']};

      baseValidator.validationError(res, err);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.send).toHaveBeenCalledWith({
        status: false,
        message: 'Validation failed',
        error: err.errors
      });
    });
  });

  describe('rules', () => {
    it('should throw an error if not implemented by child classes', () => {
      expect(() => baseValidator.rules())
        .toThrow('You have to implement the rules method!');
    });
  });

  describe('customMessages', () => {
    it('should throw an error if not implemented by child classes', () => {
      expect(() => baseValidator.customMessages())
        .toThrow('You have to implement the customMessages method!');
    });
  });

  describe('validate', () => {
    it('should call the validator method and return a validation error if the status is false', () => {
      const req = { body: { key: 'value' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
      const next = jest.fn();
      const err = { errors: ['value'] };

      class SampleValidator extends BaseValidator{
        constructor() {
          super();
        }

        rules() {
          return {
            name: 'required'
          }
        }

        customMessages() {
          return {
            required: ':attribute is required.'
          }
        }
      }

      const sampleValidator = new SampleValidator();

      sampleValidator.validator = jest.fn((body, rules, customMessages, callback) => {
        callback(err, false);
      });

      sampleValidator.validate(req, res, next);

      expect(sampleValidator.validator).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.send).toHaveBeenCalledWith({
        status: false,
        message: 'Validation failed',
        error: err.errors
      });
    });

    it('should call the validator method and return the next middleware if the status is true', () => {
      const req = { body: { key: 'value' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
      const next = jest.fn();

      class SampleValidator extends BaseValidator{
        constructor() {
          super();
        }

        rules() {
          return {
            address: 'sometimes'
          }
        }

        customMessages() {
          return {
            sometimes: ':attribute is sometimes.'
          }
        }
      }

      const sampleValidator = new SampleValidator();

      sampleValidator.validator = jest.fn((body, rules, customMessages, callback) => {
        callback(null, true);
      });

      sampleValidator.validate(req, res, next);

      expect(sampleValidator.validator).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });
  });
});