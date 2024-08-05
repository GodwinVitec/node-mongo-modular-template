const BaseValidator = require("../../../../BaseValidator");

class SignInRequest extends BaseValidator {
  rules() {
    return {
      refreshToken: 'required|string',
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


module.exports = (new SignInRequest()).validate;