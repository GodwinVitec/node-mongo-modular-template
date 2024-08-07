const BaseValidator = require("../../../../BaseValidator");

class SignUpRequest extends BaseValidator {
  rules() {
    return {
      firstName: 'required|string',
      lastName: 'required|string',
      username: 'required|string',
      email: 'required|string|email',
      password: [
        'required',
        'string',
        {"min": 8},
        {
          "regex":
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z\\d\\s:])\\S{8,}$"
        }
      ],
      passwordConfirmation: 'required|string',
    };
  }

  customMessages() {
    return {
      required: ':attribute is required',
      string: ':attribute must be a string',
      numeric: ':attribute must be a number',
      regex: ':attribute must be at least 8 characters long, must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    };
  }
}


module.exports = (new SignUpRequest()).validate;