const BaseTransformer = require("../../../BaseTransformer");

class UserAuthTokensTransformer extends BaseTransformer {
  constructor() {
    super();
  }

  transform = userAuthToken => ({
    accessToken: userAuthToken.accessToken,
    refreshToken: userAuthToken.refreshToken,
  });
}

module.exports = UserAuthTokensTransformer;