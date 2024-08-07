const UserAuthToken = require('../Models/UserAuthToken');
const Commons = require('../../../../helpers/commons');

class AuthRepository {
  constructor() {
    this.userAuthToken = UserAuthToken;

    this.commonHelper = new Commons();
  }

  async createAuthToken(authTokenData) {
    return await this.userAuthToken.create(authTokenData);
  }

  async updateAuthToken(
    filter = {},
    update = {},
    options = {},
    isMany = false
  ) {
    if (this.commonHelper.empty(filter)) {
      throw new Error(
        this.commonHelper.trans(
          "auth.errors.filterParameterRequired"
        )
      );
    }

    if(this.commonHelper.empty(update)) {
      throw new Error(
        this.commonHelper.trans(
          "auth.errors.updateParameterRequired"
        )
      );
    }

    if (!isMany) {
      return this.userAuthToken.findOneAndUpdate(
        {...filter},
        {...update},
        {...options}
      );
    }

    return this.userAuthToken.updateMany(
      {...filter},
      {...update},
      {...options}
    );
  }

  async destroyAuthToken(
    filter = {},
    isMany = false
  ) {
    if (this.commonHelper.empty(filter)) {
      throw new Error(
        this.commonHelper.trans(
          "auth.errors.filterParameterRequired"
        )
      );
    }

    if(!isMany) {
      return this.userAuthToken.findOneAndDelete(
        {...filter}
      );
    }

    return this.userAuthToken.deleteMany({...filter});
  }

  async getUserAuthTokens(filter = {}) {
    return this.userAuthToken.find({...filter});
  }


  async getUserAuthToken(filter = {}) {
    return this.userAuthToken.findOne({...filter});
  }
}

module.exports = AuthRepository;