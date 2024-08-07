const jwt = require('jsonwebtoken');
const BaseService = require('../../../BaseService');
const AuthRepository = require('../Repositories/AuthRepository');
const UserService = require('../../self/Services/UserService');
const Commons = require('../../../../helpers/commons');
const {Types} = require("mongoose");

class AuthService extends BaseService {
  constructor() {
    super();
    this.authRepository = new AuthRepository();

    this.userService = new UserService();
    this.commonHelper = new Commons();
  }

  signup = async (userData) => {
    try {
      const signUpResponse = await this.userService.create({...userData});

      if (!signUpResponse.status) {
        return signUpResponse;
      }

      return this.success(
        signUpResponse.message,
        signUpResponse.data
      );
    } catch (err) {
      return this.error(
        [
          this.commonHelper.trans(
            "auth.errors.singUp.failed"
          ),
          err.message
        ],
        err
      );
    }
  }

  attempt = async (userData) => {
    if (
      this.commonHelper.empty(userData.username) ||
      this.commonHelper.empty(userData.password)
    ) {
      return this.error(
        this.commonHelper.trans(
          "auth.signIn.requiredParameters"
        )
      );
    }

    const userExists = await this.userService.findOne({
      username: userData.username
    });

    if (!userExists.status) {
      return this.error(
        this.commonHelper.trans(
          "user.errors.account.notFound"
        )
      );
    }

    const user = userExists.data;

    const passwordMatched = await user.comparePassword(userData.password);

    if (!passwordMatched) {
      return this.error(
        this.commonHelper.trans(
          "auth.errors.signIn.invalidCredentials"
        )
      );
    }

    if (!user.isActive) {
      return this.error(
        this.commonHelper.trans(
          "user.errors.account.disabled"
        )
      );
    }

    return this.success(
      this.commonHelper.trans(
        "auth.messages.signIn.attemptSuccess"
      ),
      user
    );
  }


  getAuthTokens = async (user) => {
    const accessToken = jwt.sign(
      {
        sub: user._id
      },
      this.commonHelper.env('JWT_SECRET'),
      {
        expiresIn: this.commonHelper.env(
          'JWT_ACCESS_TOKEN_EXPIRY'
        )
      }
    );

    const refreshToken = jwt.sign(
      {
        sub: user._id
      },
      this.commonHelper.env('JWT_SECRET'),
      {
        expiresIn: this.commonHelper.env(
          'JWT_REFRESH_TOKEN_EXPIRY'
        )
      }
    );

    const userAuthTokens = await this.authRepository.createAuthToken(
      {
        user: user._id,
        accessToken,
        refreshToken
      }
    );

    return this.success(
      this.commonHelper.trans(
        "auth.messages.authTokens.generated"
      ),
      userAuthTokens
    );
  }


  refreshToken = async (refreshToken) => {
    let userId = null;

    jwt.verify(
      refreshToken,
      this.commonHelper.env('JWT_SECRET'),
      async function (err, decoded) {
        if (!(new Commons()).empty(decoded)) {
          userId = decoded.sub;
        }
      }
    );

    if(this.commonHelper.empty(userId)) {
      return this.error(
        this.commonHelper.trans(
          "auth.errors.authTokens.notFound"
        )
      );
    }

    const tokenExists = await this.authRepository.getUserAuthToken(
      {
        refreshToken,
        user: new Types.ObjectId(userId)
      }
    );

    if (
      this.commonHelper.empty(tokenExists) ||
      this.commonHelper.empty(tokenExists._id)
    ) {
      return this.error(
        this.commonHelper.trans(
          "auth.errors.authTokens.notFound"
        )
      );
    }

    const accessToken = jwt.sign(
      {
        sub: tokenExists.user
      },
      this.commonHelper.env('JWT_SECRET'),
      {
        expiresIn: this.commonHelper.env(
          'JWT_ACCESS_TOKEN_EXPIRY'
        )
      }
    );

    const newAuthTokens = await this.authRepository.updateAuthToken(
      {
        userId: tokenExists.userId,
        refreshToken
      }, {
        accessToken
      }, {
        new: true
      }
    )

    return this.success(
      this.commonHelper.trans(
        "auth.messages.authTokens.refreshed"
      ),
      newAuthTokens
    );
  }
}

module.exports = AuthService;