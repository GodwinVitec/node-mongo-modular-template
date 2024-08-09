class BaseController {
  success(
    res,
    message,
    data = null,
    code = 200
  ) {
    if (typeof message !== 'string') {
      throw new Error('The message must be a string.');
    }

    res.status(code).send({
      status: true,
      message,
      data
    });
  }

  fail(
    res,
    error,
    trace = null,
    code = 500
  ) {
    if (
      !Array.isArray(error) &&
      typeof error !== 'string'
    ) {
      throw new Error('The error must be a string or an array.');
    }

    res.status(code).send({
      status: false,
      error: Array.isArray(error) ? error : [error],
      trace
    });
  }
}

module.exports = BaseController;