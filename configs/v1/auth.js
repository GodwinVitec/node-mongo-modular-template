const AuthConfig = {
  otp: {
    allowedTypes: [
      "Login",
      "Signup"
    ],
    types: {
      LOGIN: {
        title: "Login",
        defaultDurationInMinutes: 10
      },
      SIGNUP: {
        title: "Signup",
        defaultDurationInMinutes: 15
      }
    },
  },
  account: {
    allowedStatuses: [
      "ACTIVE",
      "INACTIVE"
    ],
    statusEnums: {
      ACTIVE: "ACTIVE",
      INACTIVE: "INACTIVE"
    }
  }
};

module.exports = AuthConfig;