class BaseService {
  success(message, data= null) {
    return {
      status: true,
      message,
      data
    };
  }

  error(errors, trace= null) {
    return {
      status: false,
      errors: Array.isArray(errors) ? errors : [errors],
      trace
    };
  }
}

module.exports = BaseService;