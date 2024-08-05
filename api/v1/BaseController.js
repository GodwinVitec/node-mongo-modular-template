class BaseController {
  success(
    res,
    message,
    data = null,
    code = 200
  ) {
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
    res.status(code).send({
      status: false,
      error: Array.isArray(error) ? error : [error],
      trace
    });
  }
}

module.exports = BaseController;