const BaseService = require('../BaseService');

describe('BaseService', () => {
  class SampleService extends BaseService {
    constructor() {
      super();
    }
  }

  let sampleService;

  beforeAll(() => {
    sampleService = new SampleService();
  });

  test('should contain a success method', () => {
    expect(sampleService).toHaveProperty('success');
    expect(sampleService.success).toBeInstanceOf(Function);
  });

  test('should contain an error method', () => {
    expect(sampleService).toHaveProperty('error');
    expect(sampleService.error).toBeInstanceOf(Function);
  });

  describe('success', () => {
    test('always returns an object with status, message and data properties', () => {
      const response = sampleService.success(
        'Success message',
        {key: 'value'}
      );

      expect(response).toHaveProperty('status');
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('data');
    });

    test('the status property of the response is always true', () => {
      const response = sampleService.success(
        'Success message',
        {key: 'value'}
      );

      expect(response.status).toBe(true);
    });

    test('the message property must be equal to the message passed', () => {
      const response = sampleService.success(
        'Success message',
        {key: 'value'}
      );

      expect(response.message).toBe('Success message');
    });

    test('the data property must be null if no data is supplied', () => {
      const response = sampleService.success('Sample message');

      expect(response.data).toBeNull();
    });


    test('the data property must be the same as the data supplied', () => {
      const response = sampleService.success(
        'Sample message',
        {key: 'value'}
      );

      expect(response.data).toStrictEqual({key: 'value'});
    });
  });

  describe('error', () => {
    test('it always returns an object with status, errors and trace properties', () => {
      const error = sampleService.error(
        'Sample error',
        'error trace'
      );

      expect(error).toHaveProperty('status');
      expect(error).toHaveProperty('errors');
      expect(error).toHaveProperty('trace');
    });

    test('the status property of the response must always be false', () => {
      const error = sampleService.error(
        'Sample error',
        'error trace'
      );

      expect(error.status).toBe(false);
    });

    test('the errors property of the response must be an array', () => {
      const error = sampleService.error(
        'Sample error',
        'error trace'
      );

      expect(error.errors).toBeInstanceOf(Array);
    });

    test('the errors property of the response must have the same length as the supplied errors, and the resulting array must contain only specified errors', () => {
      const errors1 = 'Error';
      const errors2 = ['Error 1', 'Error 2'];

      const error1 = sampleService.error(
        errors1,
        'trace'
      );

      const error2 = sampleService.error(
        errors2,
        'error trace'
      );

      expect(error1.errors).toHaveLength(1);
      expect(error1.errors).toContain(errors1);
      expect(error1.errors).not.toContain('Any other thing');

      expect(error2.errors).toHaveLength(2);
      expect(error2.errors).toStrictEqual(errors2);
      expect(error2.errors).not.toContain('Any other thing');
    });

    test('the trace property of the response must be null if not supplied', () => {
      const error = sampleService.error('Sample error');

      expect(error.trace).toBeNull();
    });

    test('the trace property of the response must be equal to the value supplied', () => {
      const error = sampleService.error(
        'Sample error',
        {line1: 'error trace'}
      );

      expect(error.trace).toStrictEqual({line1: 'error trace'});
    });
  });
});