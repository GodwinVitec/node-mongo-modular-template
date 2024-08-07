const AuthConfig = {
  otp: {
    allowedTypes: [
      "Login"
    ],
    types: {
      LOGIN: {
        title: "Login",
        defaultDurationInMinutes: 10
      }
    },
  }
};

module.exports = AuthConfig;