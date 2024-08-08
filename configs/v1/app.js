const AppConfig = {
  logging: {
    logLevels: [
      'error',
      'warn',
      'info',
      'debug',
      'verbose',
      'silly'
    ],
    logLevel: {
      ERROR: 'error',
      WARN: 'warn',
      INFO: 'info',
      DEBUG: 'debug',
      VERBOSE: 'verbose',
      SILLY: 'silly'
    }
  },
  envs: {
    allowedEnvs: [
      'local',
      'staging',
      'development',
      'production'
    ],
    types: {
      LOCAL: 'local',
      STAGING: 'staging',
      DEVELOPMENT: 'development',
      PRODUCTION: 'production'
    }
  }
};

module.exports = AppConfig;