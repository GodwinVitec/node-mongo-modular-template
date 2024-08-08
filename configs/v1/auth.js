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
      "INACTIVE",
      "SUSPENDED"
    ],
    statuses: {
      ACTIVE: "ACTIVE",
      INACTIVE: "INACTIVE",
      SUSPENDED: "SUSPENDED",
    },
    suspension: {
      thresholdCounts: {
        ALERT: 3,
        WARN: 5,
        MALICIOUS: 10,
        ALARM: 15,
        DEADLY: 20
      },
      duration: {
        ALERT: 5, // 5 Minutes
        WARN: 15, // 15 Minutes
        MALICIOUS: 60 * 24, // One day
        ALARM: 60 * 24 * 7, // 7 Days
        DEADLY: 60 * 24 * 7 * 54 // One Year
      }
    }
  }
};

module.exports = AuthConfig;