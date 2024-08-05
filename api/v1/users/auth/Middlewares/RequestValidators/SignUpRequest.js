const BaseValidator = require("../../../../BaseValidator");

class SignUpRequest extends BaseValidator {
  rules() {
    return {
      firstName: 'required|string',
      lastName: 'required|string',
      username: 'required|string',
      email: 'required|string|email',
      password: 'required|string',
      passwordConfirmation: 'required|string',
    };
  }

  customMessages() {
    return {
      required: ':attribute is required',
      string: ':attribute must be a string',
      numeric: ':attribute must be a number'
    };
  }
}


module.exports = (new SignUpRequest()).validate;