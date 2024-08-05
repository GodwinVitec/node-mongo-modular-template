const path = require('path');
const envPath = path.resolve(process.cwd(), `./envs/.env.${process.env.APP_ENV}`);
const supportedLanguagesPath = path.resolve(process.cwd(), './configs/supported_languages.json');
const supportedLanguages = require(supportedLanguagesPath);

require('dotenv').config({
  path: envPath
});

class Commons {
  /**
   * Check if a value is empty. A parameter with values like undefined, null,
   * "", 0, false, [], {} are considered empty.
   * @param value
   * @returns {boolean}
   */
  empty(value) {
    return value === undefined ||
      value === null ||
      value === "" ||
      value === 0 ||
      value === false ||
      (Array.isArray(value) && !value.length) ||
      (Object.prototype.isPrototypeOf(value) && !Object.keys(value).length);
  }

  /**
   * Get the fields of the request body that have been validated
   * @param request
   * @param validator
   * @return {Object}
   */
  validated = (request, validator) => {
    const _validated = {};

    for (const key of Object.keys(validator.rules())) {
      if(this.empty(request.body[key])) {
        continue;
      }

      _validated[key] = request.body[key];
    }

    return _validated;
  }

  /**
   * Get a value from the environment variables
   *
   * @param {String} key
   * @return {String}
   */
  env = (key) => {
    return process.env[key];
  }

  /**
   * Return the translated message based on the supported
   * languages in the application.
   * If no matching value is found, an empty string is
   * returned.
   *
   * @param {String} messageKey
   * @param {String} lang
   *
   * @return {String}
   */
  trans = (messageKey, lang = 'EN') => {
    if (
      this.empty(supportedLanguages) ||
      !Array.isArray(supportedLanguages) ||
      !supportedLanguages.includes(lang)
    ) {
      return messageKey;
    }

    try {
      const languageFilePath = path.resolve(
        process.cwd(), `./resources/lang/${lang.toLowerCase()}.json`
      );

      const messages = require(languageFilePath);
      const keyParts = messageKey.split('.');

      if (keyParts.length < 2) {
        return !this.empty(messages[keyParts[0]]) ?
          messages[keyParts[0]] : messageKey;
      }

      let message = messages[keyParts[0]];

      for (const key of keyParts.slice(1)) {
        message = message[key];
      }

      return (
        !this.empty(message) &&
        typeof message === 'string'
      ) ? message : messageKey;
    } catch (err) {
      console.log(err.message);
      return messageKey;
    }
  }
}

module.exports = Commons;