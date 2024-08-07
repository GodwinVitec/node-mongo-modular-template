const path = require('path');
const envPath = path.resolve(process.cwd(), `./envs/.env.${process.env.APP_ENV}`);
const supportedLanguagesPath = path.resolve(process.cwd(), './configs/supported_languages.json');
const supportedLanguages = require(supportedLanguagesPath);
const winston = require('winston');
const moment = require('moment');

require('dotenv').config({
  path: envPath
});

class Commons {
  #logger;

  constructor() {
    this.#logger = winston.createLogger({
      level: process.env.APP_DEFAULT_LOG_LEVEL || 'info',
      format: winston.format.simple(),
      transports: [
        new winston.transports.File({
          filename: path.resolve(
            process.cwd(), `${process.env.APP_LOG_FILES ? process.env.APP_LOG_FILES + '/' : ''}${moment().format('Y-M-D')}.log`
          )
        }),
      ],
    });

    if (process.env.APP_ENV !== 'production') {
      this.#logger.add(new winston.transports.Console({
        format: winston.format.simple(),
      }));
    }
  }

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
      if (this.empty(request.body[key])) {
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
   * If no matching value is found, the messageKey is
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

  /**
   * Return the config value from a config file.
   * The 'accessString' parameter should have the config
   * filename as the first part of the string.
   * @desc All config files that must use this function
   * must have '.js' extension.
   *
   * @description For example to get a value 'duration' from
   * the 'app.js' config file, you would pass 'app.duration'
   * as the 'accessString' parameter.
   *
   * @description Configs are expected to be atomic and
   * contain no nesting, however, this function will do
   * the nesting if you specify additional values example
   * 'app.duration.demo' to get the demo property of the
   * duration key in the app.js config file.
   *
   * @description If the config file is not found, the accessString is
   * returned. Also, if the config file is found but no matching
   * value is found, the accessString is returned.
   *
   * @param {String} accessString
   * @param {String} accessPrefix
   *
   * @return {any}
   */
  config = (accessString, accessPrefix = 'v1') => {
    if (this.empty(accessString)) {
      throw new Error(
        this.trans("commons.errors.config.accessStringRequired")
      );
    }

    const parts = accessString.split('.');
    const filename = parts[0];

    const filePath = `${!this.empty(accessPrefix) ? accessPrefix + '/' : ''}${filename}`;

    try {
      const configPath = path.resolve(
        process.cwd(), `./configs/${filePath}.js`
      );

      const config = require(configPath);

      if (parts.length < 2) {
        return config;
      }

      const keyParts = parts.slice(1);

      let value = config[keyParts[0]];

      for (const key of keyParts.slice(1)) {
        value = value[key];
      }

      return !this.empty(value) ? value : accessString;
    } catch (err) {
      console.log(err.message);
      return accessString;
    }
  }

  /**
   * Provide a central logging function that will function
   * as a logger for the application.
   *
   * @param {String} logMessage
   * @param {String} logLevel
   *
   * @return {void}
   */
  log = (logMessage, logLevel = 'info') => {
    if (
      !this.config(
        "app.logging.logLevels"
      ).includes(logLevel)
    ) {
      throw new Error(
        this.trans("commons.errors.logging.invalidLevel")
      )
    }

    this.#logger[logLevel](
      `\'${moment().format("Y-M-D H:m:s") + "\': " + logMessage}`
    );
  }
}

module.exports = Commons;