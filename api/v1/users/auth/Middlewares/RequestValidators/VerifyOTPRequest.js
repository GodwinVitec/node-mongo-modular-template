const BaseValidator = require("../../../../BaseValidator");
const Commons = require("../../../../../helpers/commons");

const config = (new Commons()).config;

class VerifyOTPRequest extends BaseValidator {
  rules() {
    return {
      otp: 'required|string',
      email: 'required|string|email',
      purpose: [
        'required',
        'string',
        {
          "in": config("auth.otp.allowedTypes")
        }
      ]
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


module.exports = (new VerifyOTPRequest()).validate;