const BaseController = require('../BaseController');
const httpMocks = require('node-mocks-http');

describe('BaseController', () => {
  let baseController;
  let mockResponse;

  beforeEach(() => {
    baseController = new BaseController();
    mockResponse = httpMocks.createResponse();
  });

  test('should contain the success method', () => {
    expect(baseController).toHaveProperty('success');
    expect(baseController.success).toBeInstanceOf(Function);
  });

  test('should contain the fail method', () => {
    expect(baseController).toHaveProperty('fail');
    expect(baseController.fail).toBeInstanceOf(Function);
  });

  describe('success', () => {
    it('should send a success response with the provided message, data, and code', () => {
      baseController.success(
        mockResponse,
        'Success message',
        { key: 'value' },
        200
      );

      const actualResponseBody = mockResponse._getData();
      const expectedResponseBody = {
        status: true,
        message: 'Success message',
        data: { key: 'value' }
      };

      expect(mockResponse.statusCode).toBe(200);
      expect(actualResponseBody).toStrictEqual(expectedResponseBody);
    });

    it('should send a success response with default data and code if not provided', () => {
      baseController.success(mockResponse, 'Success message');

      const actualResponseBody = mockResponse._getData();
      const expectedResponseBody = {
        status: true,
        message: 'Success message',
        data: null
      };

      expect(mockResponse.statusCode).toBe(200);
      expect(actualResponseBody).toEqual(expectedResponseBody);
    });

    test('should throw error if the message passed is not a string', () => {
      expect(
        () => baseController.success(mockResponse, { key: 'value' })
      ).toThrow('The message must be a string.');
    });
  });

  describe('fail', () => {
    it('should send a failure response with the provided error, trace, and code', () => {
      baseController.fail(mockResponse, 'Error message', 'Error trace', 500);

      const actualResponseBody = mockResponse._getData();
      const expectedResponseBody = {
        status: false,
        error: ['Error message'],
        trace: 'Error trace'
      };

      expect(mockResponse.statusCode).toBe(500);
      expect(actualResponseBody).toEqual(expectedResponseBody);
    });

    it('should send a failure response with default trace and code if not provided', () => {
      baseController.fail(mockResponse, 'Error message');

      const actualResponseBody = mockResponse._getData();
      const expectedResponseBody = {
        status: false,
        error: ['Error message'],
        trace: null
      };

      expect(mockResponse.statusCode).toBe(500);
      expect(actualResponseBody).toEqual(expectedResponseBody);
    });

    test('should throw error if the error passed is not a string or array', () => {
      expect(() => baseController.fail(mockResponse, { key: 'value' }))
        .toThrow('The error must be a string or an array.');
    })
  });
});